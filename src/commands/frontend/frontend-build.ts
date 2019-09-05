import { resolve } from 'path';
import { pathExists, readFile, outputFile, ensureDir, copy } from 'fs-extra';
import * as del from 'del';

import {
  GithubProvider,
  Deployment,
  getSheetbaseDotJson,
  getPath,
} from '../../services/project';
import {
  github404HtmlContent,
  prerenderModifier,
} from '../../services/build';
import { exec } from '../../services/command';
import { logError, logOk, logAction } from '../../services/message';

export async function frontendBuildCommand() {
  const { deployment = {} as Deployment } = await getSheetbaseDotJson();
  const {
    provider,
    url = '',
    wwwDir = './frontend/www',
    stagingDir = './frontend/www-prod',
    destination = {},
  } = deployment;
  const {
    gitUrl, master, // github
  } = destination as GithubProvider;

  // folders
  const wwwCwd = await getPath(wwwDir);
  const stagingCwd = await getPath(stagingDir);

  // malform provider
  if (
    !provider ||
    (provider === 'github' && !destination.gitUrl)
  ) {
    return logError('FRONTEND_DEPLOY__ERROR__NO_PROVIDER');
  }

  // build code
  await logAction('Build code (could take several minutes)', async () => {
    exec('npm run build', 'frontend', 'ignore');
  });

  // prepare the staging folder
  await logAction('Prepare the deploy area', async () => {
    if (!await pathExists(stagingCwd)) {
      // create the folder
      await ensureDir(stagingCwd);
    } else {
      // clean the folder
      await del([
        // delete all files
        stagingCwd + '/**',
        '!' + stagingCwd,
        // except these
        '!' + stagingCwd + '/.git/',
      ], { force: true });
    }
    // provider specific preparations
    if (
      provider === 'github' &&
      !await pathExists(resolve(stagingCwd, '.git'))
    ) {
      // init git
      exec('git init', stagingCwd, 'ignore', true);
      // set remote
      exec('git remote add origin ' + gitUrl, stagingCwd, 'ignore', true);
      // use master or gh-pages
      if (!master) {
        exec('git checkout -b gh-pages', stagingCwd, 'ignore', true);
      }
    }
  });

  // copy file to the staging
  await logAction('Copy files', async () => {
    await copy(wwwCwd, stagingCwd);
  });

  // provider specific tweaks
  await logAction('Final touches', async () => {
    if (provider === 'github') {
      const indexHtmlContent = await readFile(resolve(stagingCwd, 'index.html'), 'utf-8');
      const title = indexHtmlContent.match(/\<title\>(.*)\<\/title\>/).pop();
      // add 404.html
      await outputFile(
        resolve(stagingCwd, '404.html'),
        github404HtmlContent(url, title),
      );
      // add CNAME
      // only when using custom domain
      if (url.indexOf('.github.io') < 0) {
        await outputFile(
          resolve(stagingCwd, 'CNAME'),
          url.split('/').filter(Boolean)[1],
        );
      }
      // add index.html SPA hack snipet
      // change base if needed
      await outputFile(
        resolve(stagingCwd, 'index.html'),
        prerenderModifier(provider, indexHtmlContent, url, true, true),
      );
    }
  });

  // done
  logOk('FRONTEND_BUILD__OK', true);
}
