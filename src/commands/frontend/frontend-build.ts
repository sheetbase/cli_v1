import { basename, resolve } from 'path';
import { homedir } from 'os';
import { execSync } from 'child_process';
import { pathExists, ensureDir, copy } from 'fs-extra';
import * as del from 'del';

import { GithubProvider, SheetbaseDeployment, getPath, getSheetbaseDotJson } from '../../services/project';
import { logError, logOk, logAction } from '../../services/message';

export async function frontendBuildCommand() {
    const name = basename(process.cwd());
    const { deployment } = await getSheetbaseDotJson();
    const { provider, sourceDir, stagingDir, destination } = deployment || {} as SheetbaseDeployment;
    const stagingCwd = !!stagingDir ? await getPath(stagingDir) :
        resolve(homedir(), 'sheetbase_staging', name);

    // no provider
    if (!provider) {
        return logError('FRONTEND_BUILD__ERROR__NO_PROVIDER');
    }

    // build code
    await logAction('Build code', async () => {
        execSync('npm run build', { cwd: 'frontend', stdio: 'ignore' });
    });

    // prepare the staging folder
    await logAction('Prepare the staging area', async () => {
        if (!await pathExists(stagingCwd)) {
            // create the folder
            await ensureDir(stagingCwd);
            // provider specific preparations
            if (provider === 'github') {
                const { url, ghPages } = destination || {} as GithubProvider;
                if (!url) {
                    return logError('FRONTEND_BUILD__ERROR__NO_GIT_URL');
                }
                // init git
                execSync('git init', { cwd: stagingCwd, stdio: 'ignore' });
                // set remote
                execSync('git remote add origin ' + url, { cwd: stagingCwd, stdio: 'ignore' });
                // use master or gh-pages
                if (ghPages) {
                    execSync('git checkout -b gh-pages',
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
        await copy(await getPath(sourceDir || './frontend/www'), stagingCwd);
    });

    // provider specific tweaks
    await logAction('Final touches', async () => {
        if (provider === 'github') {
            // add 404.html
            // add index.html SPA hack snipet
            // change base if needed
        }
    });

    // done
    logOk('FRONTEND_BUILD__OK', true);
}