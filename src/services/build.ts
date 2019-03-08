import { resolve } from 'path';
import { pathExists, readJson } from 'fs-extra';
import axios from 'axios';

import { replaceBetween  } from './utils';

export type Prerenders = Array<string | Prerender>;

export interface Prerender {
  table: string;
  location?: string;
  changefreq?: string;
  priority?: string;
}

export interface PrerenderItem {
  path: string;
  changefreq?: string;
  priority?: string;
}

export function github404HtmlContent(repo: string, title = 'Sheetbase') {
    return (
`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <script>sessionStorage.redirect = location.href;</script>
  <meta http-equiv="refresh" content="0;URL='/${repo}'"></meta>
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
  const prerenderList: Array<PrerenderItem | string> = [''];
  if (await pathExists(prerenderConfigPath)) {
    const prerenderConfig = await readJson(prerenderConfigPath);
    for (let i = 0; i < prerenderConfig.length; i++) {
      const item = prerenderConfig[i];
      if (typeof item === 'string') {
        prerenderList.push(item);
      } else {
        const { table, location, changefreq, priority } = item as Prerender;
        // load data
        const { data } = await axios({
          method: 'GET',
          url: `${backendUrl}?e=/database&table=${table}` + (!!apiKey ? '&apiKey=' + apiKey : ''),
        });
        const { data: items = [] } = data;
        // assign item
        for (let j = 0; j < items.length; j++) {
          prerenderList.push({
            path: location + '/' + items[j]['$key'],
            changefreq,
            priority,
          });
        }
      }
    }
  }
  return prerenderList;
}

export function prerenderModifier(
  provider: string,
  html: string,
  url: string,
  isIndex = false,
) {
  // replace localhost url
  html = html.replace(new RegExp('http://localhost:7777', 'g'), url);

  // change base
  // when using subfolder
  if (url.split('/').filter(Boolean).length > 2) {
    html = replaceBetween(html, url + '/', '<base href="', '"');
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
