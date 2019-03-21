import { basename, resolve } from 'path';
import { homedir } from 'os';
import { execSync } from 'child_process';
import { pathExists } from 'fs-extra';

import { GithubProvider, SheetbaseDeployment, getPath, getSheetbaseDotJson } from '../../services/project';
import { logError, logOk, logAction } from '../../services/message';

export async function frontendDeployCommand() {
    const name = basename(process.cwd());
    const { deployment } = await getSheetbaseDotJson();
    const { provider, url = 'n/a', stagingDir, destination } = deployment || {} as SheetbaseDeployment;
    const stagingCwd = !!stagingDir ? await getPath(stagingDir) :
        resolve(homedir(), 'sheetbase_staging', name);
    // check if dir exists
    if (!await pathExists(stagingCwd)) {
        return logError('FRONTEND_DEPLOY__ERROR__NO_STAGING');
    }
    // no provider
    if (!provider) {
        return logError('FRONTEND_DEPLOY__ERROR__NO_PROVIDER');
    }
    // deploy
    if (provider === 'github') {
        const { master } = destination || {} as GithubProvider;
        // add
        const addCmd = 'git add .';
        await logAction(addCmd, async () => {
            execSync(addCmd, { cwd: stagingCwd, stdio: 'ignore' });
        });
        // commit
        const commitCmd = 'git commit -m "Updated ' + new Date().toISOString() + '"';
        await logAction(commitCmd, async () => {
            execSync(commitCmd, { cwd: stagingCwd, stdio: 'ignore' });
        });
        // push
        const pushCmd = 'git push -f origin ' + (master ? 'master' : 'gh-pages');
        await logAction(pushCmd, async () => {
            execSync(pushCmd, { cwd: stagingCwd, stdio: 'ignore' });
        });
    }
    // done
    logOk('FRONTEND_DEPLOY__OK', true, [url]);
}