const ttyTable = require('tty-table');
const config = require('configstore');
const configstore = new config('sheetbase_cli');
import axios from 'axios';

import { version } from '../../index';
import { exec } from '../../services/command';
import { magenta } from '../../services/message';

interface Options {
    yes?: boolean;
}

export async function updateCommand(options: Options) {
    if (! await hasUpdate()) {
        console.log('\n Up to date :)');
    } else {
        if (!options.yes) {
            logUpdateMessage();
        } else {
            console.log('New version available, start updating now.');
            await exec('npm install -g @sheetbase/cli@latest');
        }
    }
}

export async function hasUpdate() {
    const { data: { latest } } = await axios({
        method: 'GET',
        url: `https://registry.npmjs.org/-/package/@sheetbase/cli/dist-tags`,
    });
    return (latest !== version);
}

export function logUpdateMessage() {
    const table = ttyTable(
        [{ value: 'Update available!', headerAlign: 'left', align: 'left' }],
        [
            ['Sheetbase CLI got a new version, please update by:'],
            ['$ ' + magenta('npm install -g @sheetbase/cli@latest')],
        ],
        { compact: true },
    );
    console.log('\n');
    console.log(table.render());
    console.log('\n');
}

export async function checkUpdate() {
    const now = (new Date()).getTime();
    const latestCheck = configstore.get('latest_update_check');
    const beenHours = latestCheck ? Math.round((now - latestCheck) / 60000) : 24;
    if (beenHours >= 24 && await hasUpdate()) {
        logUpdateMessage();
        configstore.set('latest_update_check', now);
    }
}