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
import { getModifiedTime } from '../../services/file';
import { gray, blue, logError, logOk, logAction } from '../../services/message';

import { Options } from './frontend';

export async function frontendPrerenderCommand(options: Options) {
    const { deployment = {} as SheetbaseDeployment } = await getSheetbaseDotJson();
    const {
        provider,
        url = '',
        stagingDir,
        wwwDir = './frontend/www',
    } = deployment;

    // folders
    const stagingCwd = !!stagingDir ? await getPath(stagingDir) :
        resolve(homedir(), 'sheetbase_staging', name);
    const wwwCwd = await getPath(wwwDir);

    // check if dir exists
    if (!await pathExists(stagingCwd)) {
        return logError('FRONTEND_DEPLOY__ERROR__NO_STAGING');
    }

    // load data
    let prerenderItems: Array<PrerenderItem | string>;
    let prerenderLoading: boolean | LoadingScreen;
    await logAction('Load prerender items', async () => {
        const { items, loading } = await loadPrerenderItems(await getFrontendConfigs());
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
        // force checker
        const forcedChecker = (path: string) => {
            let forced = false;
            // check
            const forcedItems: string[] = (options.only || '').split(',').filter(Boolean);
            for (let i = 0; i < forcedItems.length; i++) {
                const forcedItem = forcedItems[i];
                if (path.indexOf(forcedItem) > -1) {
                    forced = true; break;
                }
            }
            return forced;
        };
        // expired checker
        const expiredChecker = (prerenderPath: string) => {
            const nowTime = new Date().getTime();
            const modifiedTime = getModifiedTime(prerenderPath).getTime();
            return (nowTime - modifiedTime) > 604800000; // a week
        };
        // counter
        const countTotal = prerenderItems.length;
        let countDone = 0;
        let countSkipped = 0;
        let countForced = 0;
        let countExpired = 0;
        // process items
        for (let i = 0; i < prerenderItems.length; i++) {
            const item = prerenderItems[i];
            const path = typeof item === 'string' ? item : item.path;
            const prerenderPath = resolve(stagingCwd, path, 'index.html');
            // prerender when:
            // always /
            // not exists (new)
            // forced
            // expired
            // process

            let isForced = false;
            let isExpired = false;
            if (!!path) {
                // forced
                isForced = forcedChecker(path);
                if (isForced) {
                    countForced++;
                }
                // expired
                if (await pathExists(prerenderPath)) {
                    isExpired = expiredChecker(prerenderPath);
                    if (isExpired) {
                        countExpired++;
                    }
                }
            }
            // process
            if (
                !path || // always /
                (!!path && !await pathExists(prerenderPath)) || // not exists (new)
                options.only === '*' || // force (*)
                isForced || // forced (custom)
                isExpired // expired
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
                await page.close();
                // log item
                const status = (isForced || isExpired) ? (isExpired ? 'expired' : 'forced') : null;
                console.log('   + ' + (path || '/') + blue(!!status ? ` (${ status })` : ''));
                // count done
                countDone++;
            } else {
                console.log('   + ' + path + gray(' (skipped)'));
                countSkipped++;
            }
        }
        // log counters
        // tslint:disable-next-line:max-line-length
        console.log(EOL + `   Total: ${ countTotal } | Done: ${ countDone } | Skipped: ${ countSkipped } | Forced: ${ countForced } | Expired: ${ countExpired }`);
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
        const robotsSourcePath = resolve('.', 'robots.txt');
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
