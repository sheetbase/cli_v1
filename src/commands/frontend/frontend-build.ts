import { resolve } from 'path';
import { execSync } from 'child_process';
import { homedir } from 'os';
import { pathExists, readFile, outputFile, ensureDir, copy } from 'fs-extra';
import * as del from 'del';

import {
    GithubProvider,
    SheetbaseDeployment,
    getSheetbaseDotJson,
    getPath,
} from '../../services/project';
import {
    github404HtmlContent,
    prerenderModifier,
} from '../../services/build';
import { logError, logOk, logAction } from '../../services/message';

export async function frontendBuildCommand() {
    const { deployment = {} as SheetbaseDeployment } = await getSheetbaseDotJson();
    const {
        provider,
        url = '',
        stagingDir,
        wwwDir = './frontend/www',
        destination = {} as any,
    } = deployment;
    const {
        gitUrl, master, // github
    } = destination as GithubProvider;

    // folders
    const stagingCwd = !!stagingDir ? await getPath(stagingDir) :
        resolve(homedir(), 'sheetbase_staging', name);
    const wwwCwd = await getPath(wwwDir);

    // check if dir exists
    if (!await pathExists(stagingCwd)) {
        return logError('FRONTEND_DEPLOY__ERROR__NO_STAGING');
    }
    // malform provider
    if (
        !provider ||
        (provider === 'github' && !destination.gitUrl)
    ) {
        return logError('FRONTEND_DEPLOY__ERROR__NO_PROVIDER');
    }

    // build code
    await logAction('Build code (could take several minutes)', async () => {
        execSync('npm run build', { cwd: 'frontend', stdio: 'ignore' });
    });

    // prepare the staging folder
    await logAction('Prepare the deploy area', async () => {
        if (!await pathExists(stagingCwd)) {
            // create the folder
            await ensureDir(stagingCwd);
        } else {
            // clean the folder
            await del([
                // delete all files
                stagingCwd + '/**',
                '!' + stagingCwd,
                // except these
                '!' + stagingCwd + '/.git/',
            ], { force: true });
        }
        // provider specific preparations
        if (
            provider === 'github' &&
            !await pathExists(resolve(stagingCwd, '.git'))
        ) {
            // init git
            execSync('git init', { cwd: stagingCwd, stdio: 'ignore' });
            // set remote
            execSync('git remote add origin ' + gitUrl, { cwd: stagingCwd, stdio: 'ignore' });
            // use master or gh-pages
            if (!master) {
                execSync(
                    'git checkout -b gh-pages',
                    { cwd: stagingCwd, stdio: 'ignore' },
                );
            }
        }
    });

    // copy file to the staging
    await logAction('Copy files', async () => {
        await copy(wwwCwd, stagingCwd);
    });

    // provider specific tweaks
    await logAction('Final touches', async () => {
        if (provider === 'github') {
            const indexHtmlContent = await readFile(resolve(stagingCwd, 'index.html'), 'utf-8');
            const title = indexHtmlContent.match(/\<title\>(.*)\<\/title\>/).pop();
            const [ org, repo ] = gitUrl.replace('https://github.com/', '').replace('.git', '').split('/');
            // add 404.html
            await outputFile(
                resolve(stagingCwd, '404.html'),
                github404HtmlContent(repo, title),
            );
            // add index.html SPA hack snipet
            // change base if needed
            await outputFile(
                resolve(stagingCwd, 'index.html'),
                prerenderModifier(provider, indexHtmlContent, url, true),
            );
        }
    });

    // done
    logOk('FRONTEND_BUILD__OK', true);
}
