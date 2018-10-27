import { Options } from './project';

import { projectUrlsOpenCommand } from './project-urls-open';
import { projectUrlsListCommand } from './project-urls-list';

export async function projectUrlsCommand(command: string, params: string[], options?: Options) {
    switch (command) {
        case 'open':
            await projectUrlsOpenCommand(params, options);
        break;

        case 'list':
        default:
            await projectUrlsListCommand(options);
        break;
    }
}
