import { EOL } from 'os';
import { pathExists } from 'fs-extra';

import { GithubProvider, Deployment, getPath, getSheetbaseDotJson } from '../../services/project';
import { exec } from '../../services/command';
import { logError, logOk, logInfo, logAction } from '../../services/message';

import { Options } from './frontend';

export async function frontendDeployCommand(options: Options) {
  const { deployment = {} as Deployment } = await getSheetbaseDotJson();
  const {
    provider,
    url = 'n/a',
    stagingDir = './frontend/www-prod',
    destination = {},
  } = deployment;
  const stagingCwd = await getPath(stagingDir);
  // check if dir exists
  if (!await pathExists(stagingCwd)) {
    return logError('FRONTEND_DEPLOY__ERROR__NO_STAGING');
  }
  // no provider
  if (!provider) {
    return logError('FRONTEND_DEPLOY__ERROR__NO_PROVIDER');
  }
  // deploy
  if (provider === 'github') {
    const { master } = destination as GithubProvider;

    // add
    const addCmd = 'git add .';
    await logAction(addCmd, async () => {
      exec(addCmd, stagingCwd, 'ignore', true);
    });
    // commit
    const commitCmd = 'git commit -m ' + (
      !!options.message ?
        ('"' + options.message + '"') :
        ('"' + new Date().toISOString() + '"')
    );
    await logAction(commitCmd, async () => {
      exec(commitCmd, stagingCwd, 'ignore', true);
    });
    // push
    const pushCmd = 'git push -f origin ' + (master ? 'master' : 'gh-pages');
    await logAction(pushCmd, async () => {
      exec(pushCmd, stagingCwd, 'ignore', true);
    });

    // log additional
    if (url.indexOf('.github.io') < 0) {
      logInfo('Remember to set A record, and Enforce HTTPS:' + EOL +
        ' + 185.199.108.153' + EOL +
        ' + 185.199.109.153' + EOL +
        ' + 185.199.110.153' + EOL +
        ' + 185.199.111.153');
    }
  }
  // done
  logOk('FRONTEND_DEPLOY__OK', true, [url]);
}