import { validateEmail, validatePassword } from '../../services/utils/utils.service';
import { askForLogin } from '../../services/inquirer/inquirer.service';
import { isSignedIn, login } from '../../services/user/user.service';
import { ERROR, LOG, logError } from '../../services/message/message.service';

import { Options } from './account';

export async function accountLoginCommand(options: Options) {
    if (!options.force && await isSignedIn()) {
        return logError(LOG.ALREADY_LOGGED_IN);
    }
    if (options.web) {
        // TODO: add login from web UI.
        console.log(`This action has not yet supported!`);
    } else {
        try {
            const { email, password } = await askForLogin();
            if (
                !email ||
                !password ||
                !validateEmail(email) ||
                !validatePassword(password)
            ) {
                return logError(ERROR.INVALID_EMAIL_PASSWORD);
            }
            await login(email, password); // log user in
        } catch (error) {
            return logError(ERROR.LOGIN_FAILS);
        }
        console.log(LOG.LOGIN_SUCCESS);
    }
    return process.exit();
}