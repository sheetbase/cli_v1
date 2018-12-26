import { projectConfigUpdateCommand } from './project-config-update';
import { projectConfigImportCommand } from './project-config-import';
import { projectConfigExportCommand } from './project-config-export';
import { projectConfigsCommand } from './project-configs';

export async function projectConfigCommand(command: string, params: string[]) {
    switch (command) {
        case 'update':
        case 'set':
            await projectConfigUpdateCommand(params);
        break;

        case 'import':
        case 'im':
            await projectConfigImportCommand(params);
        break;

        case 'export':
        case 'ex':
            await projectConfigExportCommand(params);
        break;

        case 'list':
        case 'ls':
        default:
            await projectConfigsCommand();
        break;
    }
}