import { writeJson } from 'fs-extra';

import { askForGoogleOAuth2 } from '../../services/inquirer';
import {
    authorizeWithLocalhost,
    retrieveTemporaryRefeshToken,
} from '../../services/google';
import { LOG, ERROR, logError } from '../../services/message';

import { Options } from './google';

export async function googleConnectCommand(options: Options = {}) {
    try {
        let loginConfirm = 'NO';
        if (!options.yes) {
            const answer = await askForGoogleOAuth2();
            loginConfirm = (answer.loginConfirm || '').toLowerCase();
        } else {
            loginConfirm = 'yes';
        }
        if (['y', 'yes'].includes(loginConfirm)) {
            await authorizeWithLocalhost(options.fullDrive);
            const account = await retrieveTemporaryRefeshToken();
            if (options.creds) {
                await writeJson('.googlerc.json', account);
                console.log(LOG.GOOGLE_CONNECT_CREDS);
            } else {
                console.log(LOG.GOOGLE_CONNECT);
            }
        } else {
            return process.exit();
        }
    } catch (error) {
        return logError(ERROR.GOOGLE_CONNECT_FAILS);
    }
    return process.exit();
}