import { googleHelp } from '../../services/help/help.service';
import { ERROR } from '../../services/message/message.service';

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
            await googleConnectCommand(options);
        break;

        case 'disconnect':
            await googleDisconnectCommand(params);
        break;

        case 'list':
            await googleListCommand(options);
        break;

        case 'default':
            await googleDefaultCommand(params);
        break;

        default:
            console.log(`\n ` + ERROR.INVALID_SUBCOMMAND(command));
            await outputHelp();
        break;
    }
}

async function outputHelp() {
    console.log('\n' +
` Google subcommands:
${googleHelp()}`);
    return process.exit();
}
