import chalk from 'chalk';
const ttyTable = require('tty-table');

import {
    buildUrls,
    getSheetbaseDotJson, getFrontendConfigs,
} from '../../services/project';
import { getClaspConfigs } from '../../services/clasp';
import { LOG, ERROR, logError } from '../../services/message';

import { urlsHook } from '../../hooks';

import { Options } from './project';

export async function projectUrlsListCommand(options: Options) {
    let projectUrls: any;
    try {
        const { driveFolder } = await getSheetbaseDotJson();
        const { backendUrl } = await getFrontendConfigs() as any;
        const { scriptId, projectId } = await getClaspConfigs();
        projectUrls = buildUrls({
            driveFolder, backendUrl, scriptId, projectId,
        });
    } catch (error) {
        return logError(ERROR.URLS_LIST_FAILS);
    }

    // hook
    try {
        if (options.trusted && options.hook) {
            let customUrls: any;
            try {
                customUrls = await urlsHook();
            } catch (error) {
                return logError(ERROR.HOOK_ERROR(error));
            }
            projectUrls = { ...projectUrls, ...customUrls };
        }
    } catch (error) {
        return logError(ERROR.HOOK_ERROR(error));
    }

    // output
    const table = ttyTable([
        {value: 'Name', width: 100, align: 'left'},
        {value: 'Value', width: 500, align: 'left'},
    ], []);
    for(const key of Object.keys(projectUrls)) {
        table.push([key, chalk.green(projectUrls[key] || 'n/a')]);
    }
    console.log('Project urls:\n');
    console.log(table.render());
    console.log(LOG.URLS_LIST);
    return process.exit();
}