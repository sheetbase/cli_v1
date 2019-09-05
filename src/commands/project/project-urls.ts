const ttyTable = require('tty-table');

import { getConfigs, getSheetbaseDotJson } from '../../services/project';
import { getClaspConfigs } from '../../services/clasp';
import { green, logOk } from '../../services/message';

export async function projectUrlsCommand() {
  // build urls
  const urls = await buildUrls();

  // print out result
  const table = ttyTable([
    { value: 'Name', width: 100, align: 'left' },
    { value: 'Value', width: 500, align: 'left' },
  ], []);
  for (const key of Object.keys(urls)) {
    table.push([key, green(urls[key] || 'n/a')]);
  }
  console.log(table.render());

  // done
  logOk('PROJECT_URLS__OK', true);
}

export async function buildUrls() {
  // load all properties
  const { projectId, urlMaps } = await getSheetbaseDotJson();
  const { scriptId, projectId: gcpId } = await getClaspConfigs();
  const { backend, frontend } = await getConfigs();
  const properties = {
    ...backend,
    ...frontend,
    projectId,
    scriptId,
    gcpId,
  };

  // load url mapping
  const allUrlMaps = {
    ...urlMaps,
    projectId: ['drive', 'https://drive.google.com/drive/folders/'],
    scriptId: ['script', 'https://script.google.com/d/', '/edit'],
    gcpId: ['gcp', 'https://console.cloud.google.com/home/dashboard?project='],
    backendUrl: ['backend'],
  };

  // build urls
  const urls = {};
  for (const key of Object.keys(properties)) {
    const map = allUrlMaps[key];
    if (!!map) {
      const value = properties[key];
      if (!!value) {
        const [name, prefix, suffix] = map;
        urls[name || key] = !!prefix ? (prefix + value + (suffix || '')) : value;
      }
    }
  }

  return urls;
}
