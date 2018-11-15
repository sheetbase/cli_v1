const ttyTable = require('tty-table');

import {
    getAllGoogleAccounts,
    getLocalGoogleAccount,
    getDefaultGoogleAccountId,
} from '../../services/google';
import { GoogleAccount, GoogleAccounts } from '../../services/user';
import { formatDate } from '../../services/utils';
import { LOG, ERROR, logError } from '../../services/message';

import { Options } from './google';

export async function googleListCommand(options: Options) {
    const googleAccounts: GoogleAccounts = await getAllGoogleAccounts();
    const defaultGoogleAccountId: string = getDefaultGoogleAccountId();
    const rcAccount = await getLocalGoogleAccount();
    if (!googleAccounts && !rcAccount) {
        return logError(ERROR.GOOGLE_NO_ACCOUNT);
    }
    const table = ttyTable([
        {value: 'ID', width: 100},
        {value: 'Name', width: 100},
        {value: 'Email', width: 100},
        {value: 'Since', width: 100},
    ], []);
    const row = (id, name, email, at) => {
        return [id, name || '?', email || '?', formatDate(new Date(at))];
    };
    if (googleAccounts) {
        if (options.default) {
            const defaultGoogleAccount: GoogleAccount = googleAccounts[defaultGoogleAccountId];
            const { id, name, email } = defaultGoogleAccount.profile;
            const grantedAt: string = formatDate(new Date(defaultGoogleAccount.grantedAt));
            table.push(
                row(`${id} (default)`, name, email, grantedAt),
            );
        } else {
            for (const key of Object.keys(googleAccounts)) {
                let { id } = googleAccounts[key].profile;
                const { name, email } = googleAccounts[key].profile;
                const grantedAt: string = formatDate(new Date(googleAccounts[key].grantedAt));
                if (id === defaultGoogleAccountId) {
                    id = `${id} (default)`;
                }
                table.push(
                    row(id, name, email, grantedAt),
                );
            }
        }
    }
    if (rcAccount) {
        const { id, name, email } = rcAccount.profile;
        const grantedAt: string = formatDate(new Date(rcAccount.grantedAt));
        table.push(
            row(`${id} (local)`, name, email, grantedAt),
        );
    }
    console.log(table.render());
    console.log(LOG.GOOGLE_LIST);
    return process.exit();
}