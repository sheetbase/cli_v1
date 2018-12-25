import { getOAuth2Client } from '../../services/google';
import { gasWebappUpdate } from '../../services/gas';
import { getClaspConfigs } from '../../services/clasp';
import { getFrontendConfigs } from '../../services/project';
import { logError, logOk } from '../../services/message';

export async function backendDeployCommand() {

    // load default google account
    const googleClient = await getOAuth2Client();
    if (!googleClient) {
        return logError('BACKEND_DEPLOY__ERROR__NO_GOOGLE_ACCOUNT');
    }

    // load script id and deployment id
    const { scriptId } = await getClaspConfigs();
    const { backendUrl = '' } = await getFrontendConfigs();
    const deploymentId = backendUrl
        .replace('https://script.google.com/macros/s/', '')
        .replace('/exec', '');
    if (!scriptId || !deploymentId) {
        return logError('BACKEND_DEPLOY__ERROR__NO_BACKEND');
    }

    // update the web app
    const result = await gasWebappUpdate(googleClient, scriptId, deploymentId);

    // done
    logOk('BACKEND_DEPLOY__OK', true, [result]);
}