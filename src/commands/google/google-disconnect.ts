import chalk from 'chalk';

import {
    removeAllGoogleAccounts,
    removeGoogleAccount,
    removeDefaultGoogleAccount,
    removeLocalGoogleAccount,
} from '../../services/google';
import { GoogleAccounts } from '../../services/user';
import { LOG, ERROR, logError } from '../../services/message';

export async function googleDisconnectCommand(params: string[]) {
    const [ id ] = params;
    if (!id) {
        return logError(ERROR.GOOGLE_NO_ID);
    }

    let disconnectedAccounts: GoogleAccounts = {};
    try {
        if (id === 'all') {
            disconnectedAccounts = await removeAllGoogleAccounts();
        } else if (id === 'default') {
            disconnectedAccounts = await removeDefaultGoogleAccount();
        } else if (id === 'local') {
            disconnectedAccounts = await removeLocalGoogleAccount();
        } else {
            disconnectedAccounts = await removeGoogleAccount(id);
        }
    } catch (error) {
        return logError(ERROR.GOOGLE_DISCONNECT_FAILS);
    }
    if (disconnectedAccounts) {
        console.log(LOG.GOOGLE_DISCONNECT);
        console.log(' Account list:');
        for (const key of Object.keys(disconnectedAccounts || {})) {
            const { name, email } = disconnectedAccounts[key].profile;
            console.log(` + ${chalk.green(email)} ${name ? '(' + name + ')' : ''}`);
        }
    }
    return process.exit();
}