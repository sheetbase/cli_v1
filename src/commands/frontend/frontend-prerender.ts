import { resolve } from 'path';
import { homedir } from 'os';
import { pathExists, readFile, outputFile } from 'fs-extra';

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
    const { stagingDir } = deployment || {} as SheetbaseDeployment;
    const { backendUrl, apiKey = '' } = await getFrontendConfigs();
    const stagingCwd = !!stagingDir ? await getPath(stagingDir) :
        resolve(homedir(), 'sheetbase_staging', name);
    const data: {[table: string]: any[]} = {};

    // check if dir exists
    if (!await pathExists(stagingCwd)) {
        return logError('FRONTEND_DEPLOY__ERROR__NO_STAGING');
    }

    if (!prerender) {
        return logError('FRONTEND_PRERENDER__ERROR__NO_PRERENDER');
    }

    // get data
    await logAction('Load the data.', async () => {
        for (const key of Object.keys(prerender)) {
            const { data: items = [] } = await getData(
                `${backendUrl}?e=/database&table=${key}&apiKey=${apiKey}`,
            );
            data[key] = items;
        }
    });

    // render content
    const indexHtmlContent = await readFile(resolve(stagingCwd, 'index.html'), 'utf-8');
    for (const key of Object.keys(data)) {
        const items = data[key]; // get items
        await logAction('Prerender table "' + key + '".', async () => {
            const { path = '', keyField = '#', renderer } = prerender[key] || {} as SheetbasePrerender;
            for (let i = 0; i < items.length; i++) {
                const item = items[i]; // an item
                const key = item[keyField]; // item key
                // save file
                await outputFile(
                    resolve(stagingCwd, path, key, 'index.html'),
                    !!renderer ?
                        renderer(indexHtmlContent, item) :
                        prerenderer(indexHtmlContent, item),
                );
            }
        });
    }

    // done
    logOk('FRONTEND_PRERENDER__OK', true);
}