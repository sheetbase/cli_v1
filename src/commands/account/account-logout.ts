import { logout } from '../../services/user/user.service';
import { ERROR, LOG } from '../../services/message/message.service';

export async function accountLogoutCommand() {
    try {
        logout();
    } catch (error) {
        console.log(ERROR.LOGOUT_FAILS);
        return process.exit(1);
    }
    console.log(LOG.LOGOUT_SUCCESS);
    return process.exit();
}