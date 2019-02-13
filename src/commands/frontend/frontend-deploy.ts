import { basename, resolve } from 'path';
import { homedir } from 'os';
import { execSync } from 'child_process';
import { pathExists } from 'fs-extra';

import { getPath, getSheetbaseDotJson } from '../../services/project';
import { logError, logOk } from '../../services/message';

export async function frontendDeployCommand() {
    const name = basename(process.cwd());
    const { deployment } = await getSheetbaseDotJson();
    const { provider, url = 'n/a', stagingDir } = deployment || {} as any;
    const cwd = !!stagingDir ? await getPath(stagingDir) : resolve(homedir(), 'sheetbase_staging', name);
    // check if dir exists
    if (!await pathExists(cwd)) {
        return logError('FRONTEND_DEPLOY__ERROR__NO_STAGING');
    }
    // deploy
    if (provider === 'github') {
        const time = new Date().toISOString();
        const command = `git add . && git commit -m "Updated using the CLI (${time})" && git push`;
        execSync(command, { stdio: 'ignore', cwd });
    } else {
        return logError('FRONTEND_DEPLOY__ERROR__NO_PROVIDER');
    }
    // done
    logOk('FRONTEND_DEPLOY__OK', true, [url]);
}