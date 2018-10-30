import { isValid } from '../../services/project/project.service';
import { projectHelp } from '../../services/help/help.service';
import { ERROR, logError } from '../../services/message/message.service';

import { projectConfigCommand } from './project-config';
import { projectStartCommand } from './project-start';
import { projectSetupCommand } from './project-setup';
import { projectInfoCommand } from './project-info';
import { projectUrlsCommand } from './project-urls';
import { projectHooksCommand } from './project-hooks';

export interface Options {
    setup?: boolean;
    hook?: boolean;
    npm?: boolean;
    trusted?: boolean;
    backendDeploy?: boolean;
}

export async function projectCommand(command: string, params: string[] = [], options: Options = {}) {
    if (command && !['start', 'new'].includes(command) && !await isValid()) {
        return logError(ERROR.INVALID_PROJECT);
    }

    switch (command) {
        case 'start':
        case 'new':
            await projectStartCommand(params, options);
        break;

        case 'setup':
            await projectSetupCommand(options);
        break;

        case 'config':
            await projectConfigCommand(params.shift(), params, options);
        break;

        case 'urls':
            await projectUrlsCommand(params.shift(), params, options);
        break;

        case 'info':
            await projectInfoCommand();
        break;

        case 'hooks':
            await projectHooksCommand();
        break;

        default:
            console.log(`\n ` + ERROR.INVALID_SUBCOMMAND(command));
            await outputHelp();
        break;
    }
}

async function outputHelp() {
    console.log('\n' +
` Project subcommands:
${projectHelp()}`);
    return process.exit();
}