import {
    removeAllGoogleAccounts,
    removeGoogleAccount,
    removeDefaultGoogleAccount,
    removeLocalGoogleAccount,

    GoogleAccounts,
} from '../../services/google';
import { green, logError, logOk } from '../../services/message';

export async function googleDisconnectCommand(params: string[]) {
    const [ id ] = params;

    // must have a valid id
    if (!id) {
        return logError('GOOGLE_DISCONNECTED__ERROR__NO_ID');
    }

    // remove accounts
    let disconnectedAccounts: GoogleAccounts = {};
    if (id === 'all') {
        disconnectedAccounts = await removeAllGoogleAccounts();
    } else if (id === 'default') {
        disconnectedAccounts = await removeDefaultGoogleAccount();
    } else if (id === 'local') {
        disconnectedAccounts = await removeLocalGoogleAccount();
    } else {
        disconnectedAccounts = await removeGoogleAccount(id);
    }

    // log result
    if (disconnectedAccounts) {
        console.log(' Accounts disconnected:');
        for (const key of Object.keys(disconnectedAccounts || {})) {
            const { name, email } = disconnectedAccounts[key].profile;
            console.log(` + ${green(email)} ${name ? '(' + name + ')' : ''}`);
        }
    }
    logOk('GOOGLE_DISCONNECTED__OK', true);
}