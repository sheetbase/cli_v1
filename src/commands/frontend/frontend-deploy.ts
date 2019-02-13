import { basename } from 'path';
import { execSync } from 'child_process';
import { getPath, getSheetbaseDotJson } from '../../services/project';
import { logError, logOk } from '../../services/message';

export async function frontendDeployCommand() {
    const name = basename(process.cwd());
    const { deployment } = await getSheetbaseDotJson();
    const { provider, stagingDir } = deployment || {} as any;
    const cwd = !!stagingDir ? await getPath(stagingDir) : `~/sheetbase_staging/${name}`;

    // deploy
    if (provider === 'github') {
        const command = 'git add . && git commit -m "Update web app" && git push';
        execSync(command, { stdio: 'ignore', cwd });
    } else {
        return logError('FRONTEND_DEPLOY__ERROR__NO_PROVIDER');
    }

    // done
    logOk('FRONTEND_DEPLOY__OK', true);
}