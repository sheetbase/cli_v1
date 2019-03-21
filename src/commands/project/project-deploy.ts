import { logInfo, logOk } from '../../services/message';

import { backendDeployCommand } from '../backend/backend-deploy';
import { frontendDeployCommand } from '../frontend/frontend-deploy';
import { Options } from './project';

export async function projectDeployCommand(options?: Options) {

    // deploy backend
    if (!options.frontend) {
        logInfo('Deploy the backend...');
        await backendDeployCommand({ message: options.message });
    }

    // deploy frontend
    if (!options.backend) {
        logInfo('Deploy the frontend...');
        await frontendDeployCommand({ message: options.message });
    }

    // done
    logOk('PROJECT_DEPLOY__OK', true);
}