import { OAuth2Client } from 'google-auth-library';
import { resolve } from 'path';
import { pathExists, readJson } from 'fs-extra';

import { getData } from './spreadsheet';
import { replaceBetween, isHostSubfolder } from './utils';

export type Prerenders = Array<string | Prerender>;

export interface Sitemap {
  changefreq?: string;
  priority?: string;
}

export interface Prerender extends Sitemap {
  from: string;
  location?: string;
  keyField?: string; // use different field for key
  segments?: PrerenderSegment[];
}

export interface PrerenderItem extends Sitemap {
  path: string;
}

export interface PrerenderSegment extends Sitemap {
  where: string;
  equal: any;
  location?: string;
}

export interface LoadingScreen {
  html: string;
  css?: string;
}

export function github404HtmlContent(url: string, title = 'Sheetbase') {
    let subfolder = '';
    if (isHostSubfolder(url)) {
      subfolder = url.split('/').filter(Boolean)[2];
    }
    return (
`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <script>sessionStorage.redirect = location.href;</script>
  <meta http-equiv="refresh" content="0;URL='/${subfolder}'"></meta>
</head>
<body>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
</body>
</html>`
    );
}

export async function loadPrerendering(
  googleClient: OAuth2Client,
  databaseId: string,
) {
  const prerenderConfigPath = resolve('.', 'prerender.json');
  // load configs
  let items: Array<PrerenderItem | string> = [''];
  let loading: boolean | LoadingScreen = false;
  if (await pathExists(prerenderConfigPath)) {
    const {
      items: rawItems = [],
      loading: loadingScreen = false,
    } = await readJson(prerenderConfigPath);
    // loading screen
    loading = loadingScreen;
    // prerender items
    items = await parsePrerenderItems(googleClient, databaseId, rawItems);
  }
  return { items, loading };
}

export async function parsePrerenderItems(
  googleClient: OAuth2Client,
  databaseId: string,
  rawItems: Prerenders,
) {
  const prerenderItems: Array<PrerenderItem | string> = [''];
  for (let i = 0; i < (rawItems || []).length; i++) {
    const rawItem = rawItems[i];
    if (typeof rawItem === 'string') {
      prerenderItems.push(rawItem);
    } else {
      const {
        from,
        location,
        changefreq = 'monthly',
        priority = '0.5',
        keyField,
        segments,
      } = rawItem as Prerender;
      // load data
      const items = await getData(googleClient, databaseId, from);
      // assign item
      for (let j = 0; j < items.length; j++) {
        const item = items[j];
        // sort item by segment
        let hasSegment = false;
        for (let k = 0; k < (segments || []).length; k++) {
          const {
            where,
            equal,
            location: segmentLocation,
            changefreq: segmentChangefreq,
            priority: segmentPriority,
          } = segments[k];
          // matching
          if (!!item[where] && item[where] === equal) {
            prerenderItems.push({
              path: (segmentLocation || location) + '/' + item[keyField || '$key'],
              changefreq: (segmentChangefreq || changefreq),
              priority: (segmentPriority || priority),
            });
            // included in a segment
            hasSegment = true;
            break;
          }
        }
        // not have segments or not included in any segment
        if (!hasSegment) {
          prerenderItems.push({
            path: location + '/' + item[keyField || '$key'],
            changefreq,
            priority,
          });
        }
      }
    }
  }
  return prerenderItems;
}

export function prerenderModifier(
  provider: string,
  html: string,
  url: string,
  loadingScreen: boolean | LoadingScreen,
  isIndex = false,
) {
  // replace localhost url
  html = html.replace(new RegExp('http://localhost:7777', 'g'), url);

  // change base
  // only when hosting in a subfolder
  if (isHostSubfolder(url)) {
    html = replaceBetween(html, url + '/', '<base href="', '"');
  }

  // tslint:disable:max-line-length
  // loading screen
  if (!!loadingScreen) {
    let loadingHtml: string;
    let loadingCss: string;
    if (loadingScreen instanceof Object) {
      // custom
      const { html = '', css = '' } = loadingScreen;
      loadingHtml = html;
      loadingCss = css;
    } else {
      // default
      loadingHtml = '<div class="prerender-loading-screen"><div class="inner">LOADING...</div></div>';
      loadingCss = '.prerender-loading-screen{display:flex;position:fixed;height:100%;width:100%;left:0;top:0;background:#323639;text-align:center;justify-content:center;align-items:center}.prerender-loading-screen .inner {font-family:arial,sans-serif;color:#FFF}';
    }
    // replacing
    if (!!loadingHtml) {
      html = html.replace('</app-root>', `${ loadingHtml }</app-root>`);
    }
    if (!!loadingCss) {
      html = html.replace('</head>', `<style>${ loadingCss }</style></head>`);
    }
  }

  // provider specific
  if (provider === 'github' && isIndex) {
    html = html.replace(
      '<head>',
  `<head>

  <!-- Github Pages hack to allow SPA refresh without receiving 404. -->
  <script>
    (function () {
      var redirect = sessionStorage.redirect;
      delete sessionStorage.redirect;
      if (redirect && redirect != location.href) {
        history.replaceState(null, null, redirect);
      }
    })();
  </script>

    `,
    );
  }

  return html;
}
