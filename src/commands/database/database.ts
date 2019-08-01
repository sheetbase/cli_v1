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
      await databaseImportCommand(params, options);
    break;

    // export sheet data
    case 'export':
      await databaseExportCommand(params.shift(), options);
    break;

    // clear sheet data
    case 'empty':
      //
    break;

    // export all data
    case 'backup':
      //
    break;

    // import all data
    case 'restore':
      //
    break;

    default:
      logInfo('APP__INFO__INVALID_SUBCOMMAND', false, ['database']);
      console.log(databaseHelp());
    break;
  }
}