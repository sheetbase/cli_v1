import { resolve } from 'path';
import { homedir } from 'os';
import { pathExists, readFile, outputFile, remove } from 'fs-extra';

import {
    SheetbaseDeployment,
    SheetbasePrerender,
    getSheetbaseDotJson, getFrontendConfigs, getPath,
} from '../../services/project';
import { getData } from '../../services/data';
import { prerenderer } from '../../services/build';
import { logError, logOk, logAction } from '../../services/message';

export async function frontendPrerenderCommand() {
    const { deployment, prerender } = await getSheetbaseDotJson();
    const { backendUrl, apiKey = '' } = await getFrontendConfigs();
    const { url = '', stagingDir } = deployment || {} as SheetbaseDeployment;
    const stagingCwd = !!stagingDir ? await getPath(stagingDir) :
        resolve(homedir(), 'sheetbase_staging', name);

    // check if dir exists
    if (!await pathExists(stagingCwd)) {
        return logError('FRONTEND_DEPLOY__ERROR__NO_STAGING');
    }

    if (!prerender || !Object.keys(prerender).length) {
        return logError('FRONTEND_PRERENDER__ERROR__NO_PRERENDER');
    }

    // load index html
    const indexHtmlContent = await readFile(resolve(stagingCwd, 'index.html'), 'utf-8');

    // prerender
    for (const key of Object.keys(prerender)) {
        await logAction('Prerender table "' + key + '".', async () => {
            // load configs
            const prerenderConfigs = prerender[key] || {} as SheetbasePrerender;
            const { location = '', keyField = '#' } = prerenderConfigs;
            // clear previous rendered by location
            if (!!location) {
                await remove(resolve(stagingCwd, location));
            }
            // load data
            const { data: items = [] } = await getData(
                `${backendUrl}?e=/database&table=${key}` + (!!apiKey ? '&apiKey=' + apiKey : ''),
            );
            // render content
            for (let i = 0; i < items.length; i++) {
                const item = items[i]; // an item
                const remoteUrl = (url + '/' + location + '/' + item[keyField]).replace('//', '/') + '/';
                // save files
                await outputFile(
                    resolve(stagingCwd, location, item[keyField], 'index.html'),
                    prerenderer(indexHtmlContent, item, remoteUrl, prerenderConfigs),
                );
            }
        });
    }

    // done
    logOk('FRONTEND_PRERENDER__OK', true);
}