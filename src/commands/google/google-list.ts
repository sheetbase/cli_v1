const ttyTable = require('tty-table');

import {
    getAllGoogleAccounts,
    getLocalGoogleAccount,
    getDefaultGoogleAccountId,

    GoogleAccounts,
} from '../../services/google';
import { formatDate } from '../../services/utils';
import { red, green, logOk, logError } from '../../services/message';

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
        {value: 'Mode', width: 50},
    ], []);
    const row = (
        id: string,
        name: string,
        email: string,
        at: any,
        fullDrive: boolean,
    ) => {
        return [
            id,
            name || '?',
            email || '?',
            formatDate(new Date(at)),
            !!fullDrive ? red('FULL') : green('RESTRICTED'),
        ];
    };

    // print out data
    if (googleAccounts) {
        if (options.default) {
            // only the default account
            const { [defaultGoogleAccountId]: defaultGoogleAccount } = googleAccounts;
            const { id, name, email } = defaultGoogleAccount.profile;
            const grantedAt: string = formatDate(new Date(defaultGoogleAccount.grantedAt));
            const { fullDrive } = defaultGoogleAccount;
            table.push(
                row(`${id} (default)`, name, email, grantedAt, fullDrive),
            );
        } else {
            // all accounts
            for (const key of Object.keys(googleAccounts)) {
                const googleAccount = googleAccounts[key];
                let { id } = googleAccount.profile;
                const { name, email } = googleAccount.profile;
                const grantedAt: string = formatDate(new Date(googleAccount.grantedAt));
                const { fullDrive } = googleAccount;
                if (id === defaultGoogleAccountId) {
                    id = `${id} (default)`;
                }
                table.push(
                    row(id, name, email, grantedAt, fullDrive),
                );
            }
        }
    }
    if (rcAccount) {
        const { id, name, email } = rcAccount.profile;
        const grantedAt: string = formatDate(new Date(rcAccount.grantedAt));
        const { fullDrive } = rcAccount;
        table.push(
            row(`${id} (local)`, name, email, grantedAt, fullDrive),
        );
    }
    console.log(table.render());

    // done
    logOk('GOOGLE_LIST__OK', true);
}