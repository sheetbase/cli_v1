import { resolve } from 'path';
import { homedir } from 'os';
import { pathExists, outputFile } from 'fs-extra';
const superstatic = require('superstatic');
import { launch, Browser } from 'puppeteer-core';

import {
    SheetbaseDeployment,
    getSheetbaseDotJson,
    getFrontendConfigs,
    getPath,
} from '../../services/project';
import {
    PrerenderItem,
    LoadingScreen,
    loadPrerenderItems,
    prerenderModifier,
} from '../../services/build';
import { logError, logOk, logAction } from '../../services/message';

export async function frontendPrerenderCommand() {
    const { deployment = {} as SheetbaseDeployment } = await getSheetbaseDotJson();
    const {
        provider,
        url = '',
        stagingDir,
        srcDir = './frontend/src',
        wwwDir = './frontend/www',
    } = deployment;

    // folders
    const stagingCwd = !!stagingDir ? await getPath(stagingDir) :
        resolve(homedir(), 'sheetbase_staging', name);
    const srcCwd = await getPath(srcDir);
    const wwwCwd = await getPath(wwwDir);

    // check if dir exists
    if (!await pathExists(stagingCwd)) {
        return logError('FRONTEND_DEPLOY__ERROR__NO_STAGING');
    }

    // load data
    let prerenderItems: Array<PrerenderItem | string>;
    let prerenderLoading: boolean | LoadingScreen;
    await logAction('Load prerender items', async () => {
        const { items, loading } = await loadPrerenderItems(srcCwd, await getFrontendConfigs());
        prerenderItems = items;
        prerenderLoading = loading;
    });

    // server & browser
    let server: any;
    let browser: Browser;
    await logAction('Spin off the server', async () => {
        server = await superstatic.server({
            port: 7777,
            host: 'localhost',
            cwd: wwwCwd,
            config: {
                rewrites: [{ source: '**', destination: '/index.html' }],
                cleanUrls: true,
            },
            debug: false,
        }).listen();
        // browser
        browser = await launch({
            executablePath: process.env.GOOGLE_CHROME,
        });
    });

    await logAction('Prerender:', async () => {
        for (let i = 0; i < prerenderItems.length; i++) {
            const item = prerenderItems[i];
            const path = typeof item === 'string' ? item : item.path;
            const prerenderPath = resolve(stagingCwd, path, 'index.html');
            // prerender when:
            // always /
            // not exists
            // forced (todo)
            // expired (todo)
            if (
                !path ||
                (!!path && !await pathExists(prerenderPath))
            ) {
                const page = await browser.newPage();
                await page.goto('http://localhost:7777/' + path, {
                    waitUntil: 'networkidle0',
                    timeout: 1000000,
                });
                const content = prerenderModifier(
                    provider,
                    await page.content(),
                    url,
                    prerenderLoading,
                    !path,
                );
                await outputFile(prerenderPath, content);
                console.log('   + ' + (path || '/'));
                await page.close();
            }
        }
    });

    // shutdown
    await logAction('Power down the server', async () => {
        await browser.close();
        await server.close();
    });

    // done
    logOk('FRONTEND_PRERENDER__OK', true);
}
