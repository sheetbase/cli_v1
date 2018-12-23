import { projectConfigUpdateCommand } from './project-config-update';
import { projectConfigImportCommand } from './project-config-import';
import { projectConfigExportCommand } from './project-config-export';
import { projectConfigsCommand } from './project-configs';

export async function projectConfigCommand(command: string, params: string[]) {
    switch (command) {
        case 'set':
        case 'update':
            await projectConfigUpdateCommand(params);
        break;

        case 'import':
            await projectConfigImportCommand(params);
        break;

        case 'export':
            await projectConfigExportCommand(params);
        break;

        case 'list':
        default:
            await projectConfigsCommand();
        break;
    }
}