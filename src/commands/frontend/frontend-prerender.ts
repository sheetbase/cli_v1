import { resolve } from 'path';
import { homedir, EOL } from 'os';
import { pathExists, copy, outputFile } from 'fs-extra';
const superstatic = require('superstatic');
import { launch } from 'puppeteer-core';

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
    const server = await superstatic.server({
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
    const browser = await launch({
        executablePath: process.env.GOOGLE_CHROME || (
            'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
        ),
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
    await browser.close();
    await server.close();

    // sitemap
    let sitemap = '';
    await logAction('Generate sitemap.xml', async () => {
        for (let i = 0; i < prerenderItems.length; i++) {
            let item = prerenderItems[i];
            if (typeof item === 'string') {
                item = {
                    path: item,
                    changefreq: !item ? 'daily' : 'monthly',
                    priority: !item ? '1.0' : '0.5',
                };
            }
            const { path, changefreq, priority } = item;
            let remoteUrl = url + '/' + path;
            remoteUrl = remoteUrl.substr(-1) === '/' ? remoteUrl : (remoteUrl + '/');
            const lastmod = (new Date().toISOString()).substr(0, 10);
            // add to sitemap
            sitemap += (
                '   <url>' + EOL +
                '       <loc>' + remoteUrl + '</loc>' + EOL +
                '       <lastmod>' + lastmod + '</lastmod>' + EOL +
                '       <changefreq>' + changefreq + '</changefreq>' + EOL +
                '       <priority>' + priority + '</priority>' + EOL +
                '   </url>' + EOL
            );
        }
        await outputFile(
            resolve(stagingCwd, 'sitemap.xml'),
            '<?xml version="1.0" encoding="UTF-8"?>' + EOL +
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + EOL +
            sitemap + EOL +
            '</urlset>',
        );
    });

    // robots
    await logAction('Save robots.txt', async () => {
        const robotsSourcePath = resolve(srcCwd, 'robots.txt');
        const robotsDestPath = resolve(stagingCwd, 'robots.txt');
        if (await pathExists(robotsSourcePath)) {
            await copy(robotsSourcePath, robotsDestPath); // copy
        } else {
            // save new file
            await outputFile(robotsDestPath,
                'User-agent: *' + EOL +
                'Disallow:',
            );
        }
    });

    // done
    logOk('FRONTEND_PRERENDER__OK', true);
}
