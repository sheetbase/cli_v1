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
    const { stagingDir } = deployment || {} as SheetbaseDeployment;
    const stagingCwd = !!stagingDir ? await getPath(stagingDir) :
        resolve(homedir(), 'sheetbase_staging', name);

    // check if dir exists
    if (!await pathExists(stagingCwd)) {
        return logError('FRONTEND_DEPLOY__ERROR__NO_STAGING');
    }

    if (!prerender) {
        return logError('FRONTEND_PRERENDER__ERROR__NO_PRERENDER');
    }

    for (const key of Object.keys(prerender)) {
        await logAction('Prerender table "' + key + '".', async () => {
            // load configs
            const { location = '', keyField = '#' } = prerender[key] || {} as SheetbasePrerender;
            // clear previous rendered by location
            if (!!location) {
                await remove(resolve(stagingCwd, location));
            }
            // load data
            const { data: items = [] } = await getData(
                `${backendUrl}?e=/database&table=${key}&apiKey=${apiKey}`,
            );
            // load index html
            const indexHtmlContent = await readFile(resolve(stagingCwd, 'index.html'), 'utf-8');
            // render content
            for (let i = 0; i < items.length; i++) {
                const item = items[i]; // an item
                // save file
                await outputFile(
                    resolve(stagingCwd, location, item[keyField], 'index.html'),
                    prerenderer(indexHtmlContent, item),
                );
            }
        });
    }

    // done
    logOk('FRONTEND_PRERENDER__OK', true);
}