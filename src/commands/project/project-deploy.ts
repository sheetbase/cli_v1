import { exec } from '../../services/command';
import { logInfo, logOk } from '../../services/message';

export async function projectDeployCommand() {
    // deploy backend
    logInfo('Deploy the backend.');
    await exec('sheetbase backend deploy');

    // deploy frontend
    logInfo('Deploy the frontend.');
    await exec('sheetbase frontend deploy');

    // done
    logOk('PROJECT_DEPLOY__OK', true);
}