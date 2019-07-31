import { databaseHelp } from '../../services/help';
import { logInfo } from '../../services/message';

export interface Options {

}

export async function databaseCommand(command: string, params: string[] = [], options: Options = {}) {

  switch (command) {
    // import sheet data
    case 'import':
      //
    break;

    // export sheet data
    case 'export':
      //
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