import { resolve } from 'path';
import { ensureFile, writeJson } from 'fs-extra';

import { buildValidFileName } from '../../services/utils';
import { getOAuth2Client } from '../../services/google';
import { getRawData } from '../../services/spreadsheet';
import { isValid, getConfigs } from '../../services/project';
import { logError, logOk } from '../../services/message';

import { Options } from './database';

export async function databaseExportCommand(params: string[], options: Options) {
  const isProject = await isValid();
  const [ tableName, customDir ] = params;

  // no table name
  if (!tableName) {
    return logError('DATABASE__ERROR__NO_TABLE');
  }

  // load default google account
  const googleClient = await getOAuth2Client();
  if (!googleClient) {
    return logError('GOOGLE__ERROR__NO_ACCOUNT');
  }

  // get databaseId
  let databaseId = options.id;
  if (!databaseId && isProject) {
    const { backend, frontend } = await getConfigs();
    databaseId = backend.databaseId || frontend.databaseId;
  }
  if (!databaseId) {
    return logError('DATABASE__ERROR__NO_DATABASE');
  }

  // saving location
  const dir = !!customDir ? customDir : // custom
    // default
    (!isProject ?
      `sheetbase_db_${databaseId}` : // outside a project
      '__exported__' // inside a project
    );
  const fileName = buildValidFileName(
    'data-' + tableName + '-exported-' + new Date().toISOString(),
  ) + '.json';
  const savingPath = resolve(dir, fileName);

  // save the file
  await ensureFile(savingPath);
  await writeJson(
    savingPath,
    await getRawData(googleClient, databaseId, tableName),
  );

  // done
  logOk('DATABASE_EXPORT__OK', true, [savingPath]);
}