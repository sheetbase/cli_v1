import { isSignedIn } from '../../services/user/user.service';
import { ERROR, logError } from '../../services/message/message.service';

import { accountProfileGetCommand } from './account-profile-get';
import { accountProfileUpdateCommand } from './account-profile-update';
import { accountProfileOpenCommand } from './account-profile-open';

import { Options } from './account';

export async function accountProfileCommand(command: string, params: string[] = [], options: Options = {}) {
    if (!await isSignedIn()) {
        return logError(ERROR.NOT_LOGGED_IN);
    }

    switch (command) {
        case 'update':
            await accountProfileUpdateCommand(params);
        break;

        case 'open':
            await accountProfileOpenCommand();
        break;

        case 'get':
        default:
            await accountProfileGetCommand(options);
        break;
    }
}