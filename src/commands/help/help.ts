import chalk from 'chalk';
import * as figlet from 'figlet';

import { help, helpDetail } from '../../services/help';
import { version } from '../../index';

export interface Options {
  detail?: boolean;
}

export async function helpCommand(options: Options = {}) {
  console.log('\n' +
    figlet.textSync('Sheetbase', { horizontalLayout: 'full' }) +
    ` CLI ${version}`,
  );
  console.log('\n' +
    ' Usage: ' + chalk.green('sheetbase <command> [<args>] [--help] [options]'),
  );
  if (options.detail) {
    console.log(helpDetail());
  } else {
    console.log(help());
  }
  return process.exit();
}