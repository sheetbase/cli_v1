import { resolve } from 'path';
import { homedir, EOL } from 'os';
import { pathExists, outputFile, copy } from 'fs-extra';

import {
    SheetbaseDeployment,
    getSheetbaseDotJson,
    getFrontendConfigs,
    getPath,
} from '../../services/project';
import { PrerenderItem, loadPrerenderItems } from '../../services/build';
import { logError, logOk, logAction } from '../../services/message';

export async function frontendSEOCommand() {
    const { deployment = {} as SheetbaseDeployment } = await getSheetbaseDotJson();
    const {
        url = '',
        stagingDir,
        srcDir = './frontend/src',
    } = deployment;

    // folders
    const stagingCwd = !!stagingDir ? await getPath(stagingDir) :
        resolve(homedir(), 'sheetbase_staging', name);
    const srcCwd = await getPath(srcDir);

    // check if dir exists
    if (!await pathExists(stagingCwd)) {
        return logError('FRONTEND_DEPLOY__ERROR__NO_STAGING');
    }

    // load data
    let prerenderItems: Array<PrerenderItem | string>;
    await logAction('Load prerender items', async () => {
        const { items } = await loadPrerenderItems(srcCwd, await getFrontendConfigs());
        prerenderItems = items;
    });

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
    logOk('FRONTEND_SEO__OK', true);
}
