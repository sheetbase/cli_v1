import { resolve } from 'path';
import { readJson } from 'fs-extra';

import { getOAuth2Client } from '../../services/google';
import { getRawData } from '../../services/spreadsheet';
import { isValid, getConfigs } from '../../services/project';
import { getModelsVersion } from '../../services/model';
import { getData } from '../../services/fetch';
import { logError, logOk } from '../../services/message';

import { Options } from './database';

export async function databaseImportCommand(params: string[], options: Options) {
  const tableName = params[0];
  let source = params[1] || params[0];
  const isProject = await isValid();

  // no table name
  if (!tableName) {
    return logError('DATABASE__ERROR__NO_TABLE');
  }

  // no import source
  if (!source) {
    return logError('DATABASE_IMPORT__ERROR__NO_SOURCE');
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

  // get built-in model
  if (source.indexOf('.json') < 0) {
    const version = isProject ? await getModelsVersion() : 'latest';
    source = `https://unpkg.com/@sheetbase/models@${version}/data/${source}.json`;
  }

  // get data
  let data = [];
  if (
    source.indexOf('http') > -1 &&
    source.indexOf('://') > -1
  ) {
    data = await getData(source);
  } else {
    source = resolve(
      source.replace(/\\/g, '/'), // replace Windows \
    );
    data = await readJson(source);
  }

  // import the data

  // done
  logOk('DATABASE_IMPORT__OK', true, [ tableName, source ]);
}