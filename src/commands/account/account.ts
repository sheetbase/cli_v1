import { accountHelp } from '../../services/help/help.service';
import { ERROR } from '../../services/message/message.service';

import { accountLoginCommand } from './account-login';
import { accountLogoutCommand } from './account-logout';
import { accountSignupCommand } from './account-signup';
import { accountUpgradeCommand } from './account-upgrade';
import { accountProfileCommand } from './account-profile';

export interface Options {
    web?: boolean;
    force?: boolean;
    cache?: boolean;
}

export async function accountCommand(command: string, params: string[] = [], options: Options = {}) {
    switch (command) {
        case 'login':
            await accountLoginCommand(options);
        break;

        case 'logout':
            await accountLogoutCommand();
        break;

        case 'signup':
            await accountSignupCommand();
        break;

        case 'upgrade':
            await accountUpgradeCommand();
        break;

        case 'profile':
            await accountProfileCommand(params.shift(), params, options);
        break;

        default:
            console.log(`\n ` + ERROR.INVALID_SUBCOMMAND(command));
            await outputHelp();
        break;
    }
}

async function outputHelp() {
    console.log('\n' +
` Account subcommands:
${accountHelp()}`);
    return process.exit();
}