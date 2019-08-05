import { databaseHelp } from '../../services/help';
import { logInfo } from '../../services/message';

import { databaseListCommand } from './database-list';
import { databaseCreateCommand } from './database-create';
import { databaseExportCommand } from './database-export';
import { databaseImportCommand } from './database-import';

export interface Options {
  id?: string;
}

export async function databaseCommand(command: string, params: string[] = [], options: Options = {}) {

  switch (command) {
    case 'list':
      await databaseListCommand();
    break;

    case 'create':
      await databaseCreateCommand(params, options);
    break;

    case 'import':
    case 'im':
      await databaseImportCommand(params, options);
    break;

    case 'export':
    case 'ex':
      await databaseExportCommand(params, options);
    break;

    default:
      logInfo('APP__INFO__INVALID_SUBCOMMAND', false, ['db']);
      console.log(databaseHelp());
    break;
  }

}