import { exec } from '../../services/command';
import { logInfo, logOk } from '../../services/message';

import { Options } from './project';

export async function projectDeployCommand(options?: Options) {
    // backend
    if (!options.frontend) {
        // deploy backend
        logInfo('Deploy the backend.');
        await exec('sheetbase backend deploy' +
        (!!options.message ? ' -m "' + options.message + '"' : ''));
    }

    // frontend
    if (!options.backend) {
        // deploy frontend
        logInfo('Deploy the frontend.');
        await exec('sheetbase frontend deploy' +
        (!!options.message ? ' -m "' + options.message + '"' : ''));
    }

    // done
    logOk('PROJECT_DEPLOY__OK', true);
}