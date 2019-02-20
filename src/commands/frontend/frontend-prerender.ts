import { resolve } from 'path';
import { homedir } from 'os';
import { pathExists, readFile, outputFile, readJson, remove } from 'fs-extra';

import {
    SheetbaseDeployment,
    SheetbasePrerender,
    SheetbaseDirectPrerender,
    getSheetbaseDotJson, getFrontendConfigs, getPath,
} from '../../services/project';
import { getData } from '../../services/data';
import { prerenderer } from '../../services/build';
import { logError, logOk, logAction } from '../../services/message';

export async function frontendPrerenderCommand() {
    const {
        deployment = {} as SheetbaseDeployment,
        prerender = {},
        directPrerender = [],
    } = await getSheetbaseDotJson();
    const { backendUrl, apiKey = '' } = await getFrontendConfigs();
    const { url = '', stagingDir } = deployment;
    const stagingCwd = !!stagingDir ? await getPath(stagingDir) :
        resolve(homedir(), 'sheetbase_staging', name);

    // check if dir exists
    if (!await pathExists(stagingCwd)) {
        return logError('FRONTEND_DEPLOY__ERROR__NO_STAGING');
    }

    if (
        (!prerender || !Object.keys(prerender).length) &&
        (!directPrerender || !directPrerender.length)
    ) {
        return logError('FRONTEND_PRERENDER__ERROR__NO_PRERENDER');
    }

    // load index html
    const indexHtmlContent = await readFile(resolve(stagingCwd, 'index.html'), 'utf-8');

    // prerender
    for (const key of Object.keys(prerender)) {
        await logAction('Prerender "' + key + '".', async () => {
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
                const remoteUrl = (url + '/' + location + '/' + item[keyField])
                    .replace('//', '/')
                    .replace(':/', '://') + '/';
                // save files
                await outputFile(
                    resolve(stagingCwd, location, item[keyField], 'index.html'),
                    prerenderer(indexHtmlContent, item, remoteUrl, prerenderConfigs),
                );
            }
        });
    }

    // direct prerender
    if (!!directPrerender && !!directPrerender.length) {
        await logAction('Prerender direct items.', async () => {
            let items: SheetbaseDirectPrerender[];
            // load items from .json
            if (typeof directPrerender === 'string') {
                items = await readJson(resolve('.', directPrerender));
            } else {
                items = directPrerender;
            }
            // render
            for (let i = 0; i < items.length; i++) {
                const prerenderConfigs = items[i] || {} as SheetbaseDirectPrerender;
                const { keyField = '#', data } = prerenderConfigs;
                const remoteUrl = (url + '/' + data[keyField])
                    .replace('//', '/')
                    .replace(':/', '://') + '/';
                // save files
                await outputFile(
                    resolve(stagingCwd, data[keyField], 'index.html'),
                    prerenderer(indexHtmlContent, data, remoteUrl, prerenderConfigs),
                );
            }
        });
    }

    // done
    logOk('FRONTEND_PRERENDER__OK', true);
}