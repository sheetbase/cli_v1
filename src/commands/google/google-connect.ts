import { writeJson } from 'fs-extra';

import { askForGoogleOAuth2 } from '../../services/inquirer';
import {
  authorizeWithLocalhost,
  retrieveTemporaryAccount,
} from '../../services/google';
import { logOk, logWarn } from '../../services/message';

import { Options } from './google';

export async function googleConnectCommand(options: Options = {}) {
  // ask for permission
  let loginConfirm = 'NO';
  if (!options.yes) {
    const answer = await askForGoogleOAuth2();
    loginConfirm = (answer.loginConfirm || '').toLowerCase();
  } else {
    loginConfirm = 'yes';
  }

  // answer = NO
  if (!['y', 'yes'].includes(loginConfirm)) {
    return process.exit();
  }

  // go for authorization
  await authorizeWithLocalhost(options.fullDrive);
  const account = await retrieveTemporaryAccount(options.fullDrive);

  // save RC
  if (options.creds) {
    await writeJson('.googlerc.json', account);
    logWarn('GOOGLE_CONNECT__WARN__CREDS', true);
  }

  // done
  logOk('GOOGLE_CONNECT__OK', true);
}