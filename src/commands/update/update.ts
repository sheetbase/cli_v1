const ttyTable = require('tty-table');
const config = require('configstore');
const configstore = new config('sheetbase_cli');
import axios from 'axios';

import { version } from '../../index';
import { exec } from '../../services/command';
import { magenta, yellow, green } from '../../services/message';

interface Options {
  yes?: boolean;
}

export async function updateCommand(options: Options) {
  const { hasUpdate, currentVersion, latestVersion } = await getUpdateStatus();
  if (!hasUpdate) {
    console.log('\n Up to date :)');
  } else {
    if (!options.yes) {
      logUpdateMessage(currentVersion, latestVersion);
    } else {
      console.log('New version available, start updating now.');
      exec('npm install -g @sheetbase/cli@latest');
    }
  }
}

export async function getUpdateStatus() {
  const { data: { latest } } = await axios({
    method: 'GET',
    url: `https://registry.npmjs.org/-/package/@sheetbase/cli/dist-tags`,
  });
  return {
    hasUpdate: (latest !== version),
    currentVersion: version,
    latestVersion: latest,
  };
}

export function logUpdateMessage(from: string, to: string) {
  const table = ttyTable(
    [{ value: 'Update available!', headerAlign: 'left', align: 'left' }],
    [
      ['The CLI got a new version ' + yellow(from) + ' -> ' + green(to)],
      ['Update: ' + magenta('npm install -g @sheetbase/cli@latest')],
    ],
    { compact: true },
  );
  console.log(table.render());
}

export async function checkUpdate() {
  const { hasUpdate, currentVersion, latestVersion } = await getUpdateStatus();
  const now = (new Date()).getTime();
  const latestCheck = configstore.get('latest_update_check');
  const beenHours = latestCheck ? Math.round((now - latestCheck) / 3600000) : 24;
  if (beenHours >= 24 && !!hasUpdate) {
    console.log('\n');
    logUpdateMessage(currentVersion, latestVersion);
    console.log('\n');
    configstore.set('latest_update_check', now);
  }
}
