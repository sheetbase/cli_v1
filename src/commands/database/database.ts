import { databaseHelp } from '../../services/help';
import { logInfo } from '../../services/message';

import { databaseExportCommand } from './database-export';
import { databaseImportCommand } from './database-import';

export interface Options {
  id?: string;
  dir?: string;
}

export async function databaseCommand(command: string, params: string[] = [], options: Options = {}) {
  switch (command) {
    // import sheet data
    case 'import':
    case 'im':
      await databaseImportCommand(params, options);
    break;

    // export sheet data
    case 'export':
    case 'ex':
      await databaseExportCommand(params.shift(), options);
    break;

    // clear sheet data
    case 'empty':
    case 'rm':
      //
    break;

    // export all data
    case 'backup':
    case 'bk':
      //
    break;

    // import all data
    case 'restore':
    case 'rs':
      //
    break;

    default:
      logInfo('APP__INFO__INVALID_SUBCOMMAND', false, ['db']);
      console.log(databaseHelp());
    break;
  }
}