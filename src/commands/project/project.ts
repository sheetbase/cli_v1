import { isValid } from '../../services/project';
import { projectHelp } from '../../services/help';
import { logInfo, logError } from '../../services/message';

import { projectStartCommand } from './project-start';
import { projectSetupCommand } from './project-setup';
import { projectConfigsCommand } from './project-configs';
import { projectConfigCommand } from './project-config';
import { projectInfoCommand } from './project-info';
import { projectUrlsCommand } from './project-urls';
import { projectUrlCommand } from './project-url';
import { projectBuildCommand } from './project-build';
import { projectDeployCommand } from './project-deploy';
import { projectPreviewCommand } from './project-preview';

export interface Options {
  install?: boolean;
  notSetup?: boolean;
  fresh?: boolean;
  open?: boolean;
  backend?: boolean;
  frontend?: boolean;
  message?: string;
}

export async function projectCommand(command: string, params: string[] = [], options: Options = {}) {
  if (
    !!command &&
    !['start', 'new'].includes(command) &&
    !await isValid()
  ) {
    return logError('PROJECT__ERROR__INVALID');
  }

  switch (command) {
    case 'start':
    case 'new':
      await projectStartCommand(params, options);
      break;

    case 'setup':
      await projectSetupCommand(options);
      break;

    case 'configs':
      await projectConfigsCommand();
      break;

    case 'config':
      await projectConfigCommand(params.shift(), params);
      break;

    case 'urls':
      await projectUrlsCommand();
      break;

    case 'url':
      await projectUrlCommand(params.shift(), options);
      break;

    case 'info':
      await projectInfoCommand();
      break;

    case 'build':
      await projectBuildCommand(options);
      break;

    case 'deploy':
      await projectDeployCommand(options);
      break;

    case 'preview':
      await projectPreviewCommand();
      break;

    default:
      logInfo('APP__INFO__INVALID_SUBCOMMAND', false, ['project']);
      console.log(projectHelp());
      break;
  }
}
