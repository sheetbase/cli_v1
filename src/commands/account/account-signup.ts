import { askForRegister } from '../../services/inquirer/inquirer.service';
import { validateEmail, validatePassword } from '../../services/utils/utils.service';
import { register } from '../../services/user/user.service';
import { ERROR, LOG, logError } from '../../services/message/message.service';

export async function accountSignupCommand() {
    try {
        const { email, password, passwordRepeat } = await askForRegister();
        if (
            !email ||
            !password ||
            !validateEmail(email) ||
            !validatePassword(password) ||
            password !== passwordRepeat
        ) {
            return logError(ERROR.INVALID_EMAIL_PASSWORD);
        }
        await register(email, password);
    } catch (error) {
        return logError(ERROR.SIGNUP_FAILS);
    }
    console.log(LOG.SIGNUP_SUCCESS);
    return process.exit();
}