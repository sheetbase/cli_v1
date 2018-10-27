import { Options } from './project';

import { projectConfigUpdateCommand } from './project-config-update';
import { projectConfigImportCommand } from './project-config-import';
import { projectConfigExportCommand } from './project-config-export';
import { projectConfigListCommand } from './project-config-list';

export async function projectConfigCommand(command: string, params: string[], options: Options) {
    switch (command) {
        case 'update':
            await projectConfigUpdateCommand(params, options);
        break;

        case 'import':
            await projectConfigImportCommand(params, options);
        break;

        case 'export':
            await projectConfigExportCommand(params);
        break;

        case 'list':
        default:
            await projectConfigListCommand();
        break;
    }
}