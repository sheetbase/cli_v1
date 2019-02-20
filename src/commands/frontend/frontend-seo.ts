import { resolve } from 'path';
import { homedir, EOL } from 'os';
import { pathExists, outputFile, copy } from 'fs-extra';

import {
    SheetbaseDeployment,
    SheetbasePrerender,
    getSheetbaseDotJson, getFrontendConfigs, getPath,
} from '../../services/project';
import { getData } from '../../services/data';
import { logError, logOk, logAction } from '../../services/message';

export async function frontendSEOCommand() {
    const { deployment, prerender } = await getSheetbaseDotJson();
    const { backendUrl, apiKey = '' } = await getFrontendConfigs();
    const {
        url = '',
        stagingDir,
        srcDir = './frontend/src',
    } = deployment || {} as SheetbaseDeployment;
    const srcCwd = await getPath(srcDir);
    const stagingCwd = !!stagingDir ? await getPath(stagingDir) :
        resolve(homedir(), 'sheetbase_staging', name);

    // check if dir exists
    if (!await pathExists(stagingCwd)) {
        return logError('FRONTEND_DEPLOY__ERROR__NO_STAGING');
    }
    if (!prerender || !Object.keys(prerender).length) {
        return logError('FRONTEND_PRERENDER__ERROR__NO_PRERENDER');
    }

    // sitemap
    let sitemap = '';
    for (const key of Object.keys(prerender)) {
        await logAction('Generate sitemap for table "' + key + '".', async () => {
            // load configs
            const prerenderConfigs = prerender[key] || {} as SheetbasePrerender;
            const {
                location = '',
                keyField = '#',
                rewriteFields: fields = {},
                changefreq = 'daily',
                priority = '0.5',
            } = prerenderConfigs;
            // load data
            const { data: items = [] } = await getData(
                `${backendUrl}?e=/database&table=${key}` + (!!apiKey ? '&apiKey=' + apiKey : ''),
            );
            // render content
            for (let i = 0; i < items.length; i++) {
                const item = items[i]; // an item
                const remoteUrl = (url + '/' + location + '/' + item[keyField]).replace('//', '/') + '/';
                const lastMod = (
                    item[fields['updatedAt'] || 'updatedAt'] ||
                    new Date().toISOString()
                ).substr(0, 10);
                // add to sitemap
                sitemap += (
                    '   <url>' + EOL +
                    '       <loc>' + remoteUrl + '</loc>' + EOL +
                    '       <lastmod>' + lastMod + '</lastmod>' + EOL +
                    '       <changefreq>' + changefreq + '</changefreq>' + EOL +
                    '       <priority>' + priority + '</priority>' + EOL +
                    '   </url>' + EOL
                );
            }
        });
    }
    await logAction('Save sitemap.xml.', async () => {
        await outputFile(
        resolve(stagingCwd, 'sitemap.xml'),
            '<?xml version="1.0" encoding="UTF-8"?>' + EOL +
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + EOL +
            sitemap + EOL +
            '</urlset>',
        );
    });

    // robots
    await logAction('Save robots.txt.', async () => {
        const robotsDest = resolve(stagingCwd, 'robots.txt');
        const robotsSource = resolve(srcCwd, 'robots.txt');
        if (await pathExists(robotsSource)) {
            await copy(robotsSource, robotsDest); // copy
        } else {
            // save new file
            await outputFile(robotsDest,
                'User-agent: *' + EOL +
                'Disallow:',
            );
        }
    });

    // done
    logOk('FRONTEND_SEO__OK', true);
}