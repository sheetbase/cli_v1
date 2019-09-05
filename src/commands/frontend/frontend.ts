import { run } from '../../services/command';
import { readJson } from '../../services/project';

import { frontendBuildCommand } from './frontend-build';
import { frontendDeployCommand } from './frontend-deploy';
import { frontendPrerenderCommand } from './frontend-prerender';

export interface Options {
  message?: string;
  force?: string;
  only?: string;
}

export async function frontendCommand(command: string, options: any) {
  const commanderRawArgs = options['parent']['rawArgs'];
  const cwd = 'frontend';

  switch (command) {
    case 'build':
      await frontendBuildCommand();
      break;

    case 'deploy':
      await frontendDeployCommand(options);
      break;

    case 'prerender':
      await frontendPrerenderCommand(options);
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
