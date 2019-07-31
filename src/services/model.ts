import { pathExists, readJson } from 'fs-extra';

import { readdirAsync } from './file';
import { ModelExtended, getSheetbaseDotJson } from './project';
import { getData } from './fetch';

export interface ModelSchema {
  name: string;
  width?: number;
  note?: string;
}

export interface Model {
  gid: string | number;
  public?: boolean;
  schema: ModelSchema[];
}

export async function loadModels(): Promise<{[name: string]: Model}> {
  // built-in models
  let builtInModels: {[name: string]: Model} = {};
  const { models: configBuiltInModels } = await getSheetbaseDotJson();
  if (!!configBuiltInModels) {
    const { dependencies } = await readJson('frontend/package.json');
    const version = dependencies['@sheetbase/models']
      .replace('~', '')
      .replace('^', '');
    builtInModels = await getRemoteModels(configBuiltInModels, version);
  }
  // load models in models folder
  const modelsPath = 'models';
  let localModels: {[name: string]: Model} = {};
  if (await pathExists(modelsPath)) {
    const filePaths = (await readdirAsync(modelsPath)).map(x => modelsPath + '/' + x);
    localModels = await getLocalModels(filePaths);
  }
  // all project models
  return { ... builtInModels, ... localModels };
}

export async function getLocalModels(
  filePaths: string[],
): Promise<{[name: string]: Model}> {
  const models = {};
  for (let i = 0; i < filePaths.length; i++) {
    const filePath = filePaths[i];
    if (filePath.endsWith('.json')) {
      let modelFile = '';
      if (filePath.indexOf('\\') > -1) { // windows path
        modelFile = filePath.split('\\').pop();
      } else {
        modelFile = filePath.split('/').pop();
      }
      const modelName = modelFile.replace('.json', '');
      let modelData: ModelSchema[] | Model = await readJson(filePath);
      if (modelData instanceof Array) {
        modelData = { gid: null, schema: modelData };
      }
      models[modelName] = modelData;
    }
  }
  return models;
}

export async function getRemoteModels(
  configBuiltInModels: Array<string | ModelExtended>,
  version = 'latest',
): Promise<{[name: string]: Model}> {
  // fetcher
  const modelFetcher = async (name: string) => {
    const url = `https://unpkg.com/@sheetbase/models@${ version }/models/${ name }.json`;
    return await getData(url);
  };
  // get models
  const builtInModels = {};
  for (let i = 0; i < configBuiltInModels.length; i++) {
    const builtInModel = configBuiltInModels[i];
    // get model
    let modelName = (typeof builtInModel === 'string') ? builtInModel : builtInModel.from;
    let modelData: ModelSchema[] | Model = await modelFetcher(modelName);
    if (modelData instanceof Array) {
      modelData = { gid: null, schema: modelData };
    }
    // extends
    if (builtInModel instanceof Object) {
      const { name, gid, public: isPublic } = builtInModel;
      modelName = name; // rename
      modelData.gid = gid; // change gid
      if (isPublic) {
        modelData.public = true; // override public
      } else if (!isPublic && !!modelData.public) {
        delete modelData.public; // remove public
      }
    }
    // save to builtin
    builtInModels[modelName] = modelData;
  }
  return builtInModels;
}
