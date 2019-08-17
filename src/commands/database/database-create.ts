import { isUrl } from '../../services/utils';
import { getOAuth2Client } from '../../services/google';
import { getSheets, createSheetByModel, deleteDefaultSheet } from '../../services/spreadsheet';
import { isValid, getConfigs, setConfigs } from '../../services/project';
import { logError, logAction } from '../../services/message';
import {
  Model,
  getBuiltinModels, getLocalModels, getRemoteModels,
  loadProjectModels,
} from '../../services/model';
import { getData } from '../../services/fetch';
import { addData } from '../../services/spreadsheet';

import { Options } from './database';

export async function databaseCreateCommand(inputs: string[], options: Options) {
  const isProject = await isValid();

  // require input (outside a project & no custom)
  if (
    !isProject && // outside
    (!inputs.length || inputs[0] === '*') // no custom
  ) {
    return logError('DATABASE_CREATE__ERROR__NO_INPUT');
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

  // get models
  let serverTables = {}; // current tables on the server
  const databaseGids = {}; // save public gids here
  const skippedTables = []; // save skipped tables here
  let inputModels: {[name: string]: Model}; // all input models
  await logAction('Load data', async () => {
    // get server tables
    serverTables = await getSheets(googleClient, databaseId);
    // get project models
    let projectModels: {[name: string]: Model};
    if (isProject) {
      projectModels = await loadProjectModels();
    }
    // get custom models
    let customModels: {[name: string]: Model};
    if (!!inputs.length && inputs[0] !== '*') {
      // sort input by type
      const builtinInputs: string[] = [];
      const localInputs: string[] = [];
      const remoteInputs: string[] = [];
      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i];
        if (isUrl(input)) {
          remoteInputs.push(input);
        } else if (input.indexOf('.json') > -1) {
          localInputs.push(input);
        } else {
          builtinInputs.push(input);
        }
      }
      // load data
      let builtinModels: {[name: string]: Model};
      let localModels: {[name: string]: Model};
      let remoteModels: {[name: string]: Model};
      if (!!builtinInputs.length) {
        builtinModels = await getBuiltinModels(builtinInputs);
      }
      if (!!localInputs.length) {
        localModels = await getLocalModels(localInputs);
      }
      if (!!remoteInputs.length) {
        remoteModels = await getRemoteModels(remoteInputs);
      }
      customModels = { ... builtinModels, ... localModels, ... remoteModels };
    }
    // sum up models
    inputModels = { ... projectModels, ... customModels };
    // refine input models
    // assign gid if not defined
    // and check for duplication
    const existingGids = {};
    // set global gids
    Object.keys(serverTables).map(key =>
      existingGids[serverTables[key]] = key,
    );
    // check all input models
    for (const modelName of Object.keys(inputModels)) {
      const inputModel = inputModels[modelName];
      if (!!serverTables[modelName]) {
        skippedTables.push(modelName); // save to skipped tables
        delete inputModels[modelName]; // remove any model if already exists
      } else {
        const gid = inputModel.gid;
        if (!gid) {
          inputModel.gid = Math.round(Math.random() * 1E9);
          existingGids[inputModel.gid] = modelName;
        } else if (!!existingGids[gid]) {
          return logError('PROJECT_MODEL__ERROR__DUPLICATE_GID', true, [
            modelName, existingGids[gid],
          ]);
        } else {
          existingGids[gid] = modelName;
        }
      }
      // save public gids
      const inputModelGid = '' + inputModel.gid; // convert to string
      if (
        // must be public
        inputModel.public &&
        // not a builtin gid
        (
          inputModelGid.length !== 3 ||
          inputModelGid[0] !== '1'
        )
      ) {
        databaseGids[modelName] = inputModelGid;
      }
    }
  });

  // create
  await logAction('Create database tables:', async () => {
    // create table by table
    for (const modelName of Object.keys(inputModels)) {
      const inputModel = inputModels[modelName];
      const withData = (!!inputModel.dataUrl && options.data);
      await createSheetByModel(googleClient, databaseId, modelName, inputModel);
      console.log(
        '   + ' + modelName +
        ' (' + inputModel.gid + ')' +
        (withData ? ' [data]' : ''),
      );
      // add sample data
      if (withData) {
        const values = await getData(inputModel.dataUrl);
        // remove the header
        if (!!values && !!values[0] && values[0][0] === '#') {
          values.shift();
        }
        // import the values
        if (!!values && !!values.length) {
          await addData(googleClient, databaseId, modelName, values);
        }
      }
    }
    // save gid maps to config
    if (
      isProject &&
      !!Object.keys(databaseGids).length
    ) {
      await setConfigs({ databaseGids });
    }
    // delete the default 'Sheet1'
    if (serverTables['Sheet1'] === '0') {
      await deleteDefaultSheet(googleClient, databaseId);
    }
  });

  // done
  if (!!skippedTables.length) {
    console.log('\n   Skipped: ' + skippedTables.join(', '));
  }
}