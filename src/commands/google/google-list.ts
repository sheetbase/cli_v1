const ttyTable = require('tty-table');

import {
    getAllGoogleAccounts,
    getLocalGoogleAccount,
    getDefaultGoogleAccountId,

    GoogleAccounts,
} from '../../services/google';
import { formatDate } from '../../services/utils';
import { logOk, logError } from '../../services/message';

import { Options } from './google';

export async function googleListCommand(options: Options) {

    // load accounts, default id and rc account
    const googleAccounts: GoogleAccounts = await getAllGoogleAccounts();
    const defaultGoogleAccountId: string = getDefaultGoogleAccountId();
    const rcAccount = await getLocalGoogleAccount();
    if (!googleAccounts && !rcAccount) {
        return logError('GOOGLE__ERROR__NO_ACCOUNT');
    }

    // print out layout
    const table = ttyTable([
        {value: 'ID', width: 100},
        {value: 'Name', width: 100},
        {value: 'Email', width: 100},
        {value: 'Since', width: 100},
    ], []);
    const row = (id, name, email, at) => {
        return [id, name || '?', email || '?', formatDate(new Date(at))];
    };

    // print out data
    if (googleAccounts) {
        if (options.default) {
            // only the default account
            const { [defaultGoogleAccountId]: defaultGoogleAccount } = googleAccounts;
            const { id, name, email } = defaultGoogleAccount.profile;
            const grantedAt: string = formatDate(new Date(defaultGoogleAccount.grantedAt));
            table.push(
                row(`${id} (default)`, name, email, grantedAt),
            );
        } else {
            // all accounts
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

    // done
    logOk('GOOGLE_LIST__OK', true);
}