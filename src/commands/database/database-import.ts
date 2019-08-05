import { resolve } from 'path';
import { readJson } from 'fs-extra';

import { getOAuth2Client } from '../../services/google';
import { addData } from '../../services/spreadsheet';
import { isValid, getConfigs } from '../../services/project';
import { getModelsPackageVersion } from '../../services/model';
import { getData } from '../../services/fetch';
import { logError, logOk } from '../../services/message';

import { Options } from './database';

export async function databaseImportCommand(params: string[], options: Options) {
  const [ tableName ] = params;
  let source = params[1] || tableName;
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
    const version = isProject ? await getModelsPackageVersion() : 'latest';
    source = `https://unpkg.com/@sheetbase/models@${version}/data/${source}.json`;
  }

  // get values
  let values = [];
  if (
    source.indexOf('http') > -1 &&
    source.indexOf('://') > -1
  ) {
    values = await getData(source);
  } else {
    source = resolve(
      source.replace(/\\/g, '/'), // replace Windows \
    );
    values = await readJson(source);
  }

  // refine and checking the values
  if (!!values && !!values[0] && values[0][0] === '#') {
    values.shift(); // remove the header
  }
  if (!values || !values.length) {
    return logError('DATABASE_IMPORT__ERROR__NO_DATA', true, [ source ]);
  }

  // import the values
  await addData(googleClient, databaseId, tableName, values);

  // done
  logOk('DATABASE_IMPORT__OK', true, [ tableName, source ]);
}