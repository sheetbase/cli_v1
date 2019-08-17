import { googleHelp } from '../../services/help';
import { logInfo } from '../../services/message';

import { googleConnectCommand } from './google-connect';
import { googleDisconnectCommand } from './google-disconnect';
import { googleListCommand } from './google-list';
import { googleDefaultCommand } from './google-default';

export interface Options {
    yes?: boolean;
    default?: boolean;
    creds?: boolean;
    fullDrive?: boolean;
}

export async function googleCommand(command: string, params?: string[], options?: Options) {
    switch (command) {
        case 'connect':
        case 'login':
        case 'add':
            await googleConnectCommand(options);
        break;

        case 'disconnect':
        case 'logout':
        case 'remove':
        case 'rm':
            await googleDisconnectCommand(params);
        break;

        case 'list':
        case 'ls':
            await googleListCommand(options);
        break;

        case 'default':
            await googleDefaultCommand(params);
        break;

        default:
            logInfo('APP__INFO__INVALID_SUBCOMMAND', false, ['google']);
            console.log(googleHelp());
        break;
    }
}
