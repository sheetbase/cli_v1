import { exec, run } from '../../services/command';
import { readJson } from '../../services/project';

import { backendPushCommand } from './backend-push';
import { backendDeployCommand } from './backend-deploy';

export interface Options {
  message?: string;
}

export async function backendCommand(command: string, options: any) {
  const commanderRawArgs = options['parent']['rawArgs'];
  const cwd = 'backend';

  switch (command) {
    case 'build':
      exec('npm run build', cwd);
      break;

    case 'push':
      await backendPushCommand();
      break;

    case 'deploy':
      await backendDeployCommand(options);
      break;

    case 'install':
    case 'i':
      run('npm install', command, commanderRawArgs, cwd);
      break;

    case 'uninstall':
    case 'un':
      run('npm uninstall', command, commanderRawArgs, cwd);
      break;

    case 'run':
      run('npm run', command, commanderRawArgs, cwd, true);
      break;

    default:
      let cmd = command;
      // run script if available
      const { scripts = {} } = await readJson('package.json', cwd);
      if (!!scripts[command]) {
        cmd = 'npm run ' + command;
      }
      run(cmd, command, commanderRawArgs, cwd);
      break;
  }
}
