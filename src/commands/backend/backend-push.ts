import { getOAuth2Client } from '../../services/google';
import { gasPush } from '../../services/gas';
import { getClaspConfigs } from '../../services/clasp';
import { logError, logOk } from '../../services/message';

export async function backendPushCommand() {

  // load default google account
  const googleClient = await getOAuth2Client();
  if (!googleClient) {
    return logError('GOOGLE__ERROR__NO_ACCOUNT');
  }

  // load script id
  const { scriptId } = await getClaspConfigs();
  if (!scriptId) {
    return logError('BACKEND__ERROR__INVALID');
  }

  // push files
  const result = await gasPush(googleClient, scriptId);

  // done
  logOk('BACKEND_PUSH__OK', true, [result]);
}