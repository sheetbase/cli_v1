import { projectUrlsOpenCommand } from './project-urls-open';
import { projectUrlsListCommand } from './project-urls-list';

export async function projectUrlsCommand(command: string, params: string[]) {
    switch (command) {
        case 'open':
        case 'o':
            await projectUrlsOpenCommand(params);
        break;

        case 'list':
        default:
            await projectUrlsListCommand();
        break;
    }
}
