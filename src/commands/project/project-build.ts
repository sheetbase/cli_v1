import { exec } from '../../services/command';
import { logInfo, logOk } from '../../services/message';

import { frontendBuildCommand } from '../frontend/frontend-build';
import { frontendPrerenderCommand } from '../frontend/frontend-prerender';
import { Options } from './project';

export async function projectBuildCommand(options?: Options) {

  // backend
  if (!options.frontend) {
    // build backend
    logInfo('Build the backend...');
    exec('npm run build', 'backend');
  }

  // frontend
  if (!options.backend) {
    // build frontend
    logInfo('Build the frontend...');
    await frontendBuildCommand();
    // pre-render content
    logInfo('Prerender the content...');
    await frontendPrerenderCommand({});
  }

  // done
  logOk('PROJECT_BUILD__OK', true);

}