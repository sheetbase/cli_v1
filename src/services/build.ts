import { resolve } from 'path';
import { pathExists, readJson } from 'fs-extra';
import axios from 'axios';

import { replaceBetween, isHostSubfolder } from './utils';

export type Prerenders = Array<string | Prerender>;

export interface Prerender {
  from: string;
  location?: string;
  changefreq?: string;
  priority?: string;
}

export interface PrerenderItem {
  path: string;
  changefreq?: string;
  priority?: string;
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

export async function loadPrerenderItems(srcCwd: string, frontendConfigs: any) {
  const { backendUrl, apiKey = '' } = frontendConfigs;
  const prerenderConfigPath = resolve(srcCwd, 'prerender.json');
  // load items
  const prerenderItems: Array<PrerenderItem | string> = [''];
  let loading: boolean | LoadingScreen;
  if (await pathExists(prerenderConfigPath)) {
    const {
      items: rawItems = [],
      loading: loadingScreen = false,
    } = await readJson(prerenderConfigPath);
    loading = loadingScreen;
    // process items
    for (let i = 0; i < rawItems.length; i++) {
      const rawItem = rawItems[i];
      if (typeof rawItem === 'string') {
        prerenderItems.push(rawItem);
      } else {
        const { from, location, changefreq, priority } = rawItem as Prerender;
        // load data
        const { data } = await axios({
          method: 'GET',
          url: `${backendUrl}?e=/database&table=${from}` + (!!apiKey ? '&apiKey=' + apiKey : ''),
        });
        const { data: items = [] } = data;
        // assign item
        for (let j = 0; j < items.length; j++) {
          prerenderItems.push({
            path: location + '/' + items[j]['$key'],
            changefreq,
            priority,
          });
        }
      }
    }
  }
  return { items: prerenderItems, loading };
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
      loadingHtml = '<div class="prerender-loading-screen"><div class="inner"><img src="assets/icon/favicon.png"><span>LOADING</span></div></div>';
      loadingCss = '.prerender-loading-screen{display:flex;position:fixed;height:100%;width:100%;left:0;top:0;background:#323639;text-align:center;justify-content:center;align-items:center}.prerender-loading-screen .inner img{width:35px}.prerender-loading-screen .inner span{display:block;font-family:arial,sans-serif;font-size:.9em;color:#FFF}';
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
