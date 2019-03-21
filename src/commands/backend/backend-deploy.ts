import { getOAuth2Client } from '../../services/google';
import { gasWebappUpdate } from '../../services/gas';
import { getClaspConfigs } from '../../services/clasp';
import { getFrontendConfigs } from '../../services/project';
import { logError, logOk } from '../../services/message';

import { Options } from './backend';

export async function backendDeployCommand(options: Options) {

    // load default google account
    const googleClient = await getOAuth2Client();
    if (!googleClient) {
        return logError('GOOGLE__ERROR__NO_ACCOUNT');
    }

    // load script id and deployment id
    const { scriptId } = await getClaspConfigs();
    const { backendUrl = '' } = await getFrontendConfigs();
    const deploymentId = backendUrl
        .replace('https://script.google.com/macros/s/', '')
        .replace('/exec', '');
    if (!scriptId || !deploymentId) {
        return logError('BACKEND__ERROR__INVALID');
    }

    // update the web app
    await gasWebappUpdate(googleClient, scriptId, deploymentId, null, options.message);

    // done
    logOk('BACKEND_DEPLOY__OK', true);
}