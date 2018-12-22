import { isValid } from '../../services/project';
import { projectHelp } from '../../services/help';
import { logInfo, logError } from '../../services/message';

import { projectConfigCommand } from './project-config';
import { projectStartCommand } from './project-start';
import { projectSetupCommand } from './project-setup';
import { projectInfoCommand } from './project-info';
import { projectUrlsCommand } from './project-urls';

export interface Options {
    npm?: boolean;
    setup?: boolean;
}

export async function projectCommand(command: string, params: string[] = [], options: Options = {}) {
    if (
        !!command &&
        !['start', 'new'].includes(command) &&
        !await isValid()
    ) {
        return logError('INVALID_PROJECT');
    }

    switch (command) {
        case 'start':
        case 'new':
            await projectStartCommand(params, options);
        break;

        case 'setup':
            await projectSetupCommand();
        break;

        case 'config':
            await projectConfigCommand(params.shift(), params);
        break;

        case 'urls':
            await projectUrlsCommand(params.shift(), params);
        break;

        case 'info':
            await projectInfoCommand();
        break;

        default:
            logInfo('INVALID_SUBCOMMAND');
            console.log(projectHelp());
        break;
    }
}
