import { basename, resolve } from 'path';
import { homedir } from 'os';
import { execSync } from 'child_process';
import { pathExists } from 'fs-extra';

import { GithubProvider, SheetbaseDeployment, getPath, getSheetbaseDotJson } from '../../services/project';
import { logError, logOk } from '../../services/message';

export async function frontendDeployCommand() {
    const name = basename(process.cwd());
    const { deployment } = await getSheetbaseDotJson();
    const { provider, url = 'n/a', stagingDir, destination } = deployment || {} as SheetbaseDeployment;
    const stagingCwd = !!stagingDir ? await getPath(stagingDir) :
        resolve(homedir(), 'sheetbase_staging', name);
    // no provider
    if (!provider) {
        return logError('FRONTEND_DEPLOY__ERROR__NO_PROVIDER');
    }
    // check if dir exists
    if (!await pathExists(stagingCwd)) {
        return logError('FRONTEND_DEPLOY__ERROR__NO_STAGING');
    }
    // deploy
    if (provider === 'github') {
        const { master } = destination || {} as GithubProvider;
        execSync('git add .', { cwd: stagingCwd, stdio: 'ignore' });
        execSync(
            'git commit -m "Updated ' + new Date().toISOString() + '"',
            { cwd: stagingCwd, stdio: 'ignore' },
        );
        execSync(
            'git push origin ' + (master ? 'master' : 'gh-pages'),
            { cwd: stagingCwd, stdio: 'ignore' },
        );
    }
    // done
    logOk('FRONTEND_DEPLOY__OK', true, [url]);
}