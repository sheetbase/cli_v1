import { basename, resolve } from 'path';
import { homedir } from 'os';
import { execSync } from 'child_process';
import { pathExists, readFile, outputFile, ensureDir, copy } from 'fs-extra';
import * as del from 'del';

import { GithubProvider, SheetbaseDeployment, getPath, getSheetbaseDotJson } from '../../services/project';
import { github404HtmlContent, githubIndexHtmlSPAGenerator } from '../../services/build';
import { logError, logOk, logAction } from '../../services/message';

export async function frontendBuildCommand() {
    const name = basename(process.cwd());
    const { deployment } = await getSheetbaseDotJson();
    const {
        provider,
        wwwDir = './frontend/www',
        stagingDir,
        destination,
    } = deployment || {} as SheetbaseDeployment;
    const {
        gitUrl, master, changeBase, // github
    } = destination || {} as GithubProvider;
    const stagingCwd = !!stagingDir ? await getPath(stagingDir) :
        resolve(homedir(), 'sheetbase_staging', name);

    // no provider
    if (!provider) {
        return logError('FRONTEND_DEPLOY__ERROR__NO_PROVIDER');
    }
    // no required destination
    if (provider === 'github' && !gitUrl) {
        return logError('FRONTEND_DEPLOY__ERROR__NO_GIT_URL');
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
            // provider specific preparations
            if (provider === 'github') {
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
    });

    // copy file to the staging
    await logAction('Copy files', async () => {
        await copy(await getPath(wwwDir), stagingCwd);
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
                githubIndexHtmlSPAGenerator(
                    indexHtmlContent,
                    changeBase ? `https://${org}.github.io/${repo}/` : null,
                ),
            );
        }
    });

    // done
    logOk('FRONTEND_BUILD__OK', true);
}