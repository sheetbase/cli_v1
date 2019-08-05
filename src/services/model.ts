import { resolve } from 'path';
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
  gid: string | number; // will be corverted to string
  public?: boolean;
  dataUrl?: string;
  schema: ModelSchema[];
}

export async function getModelsPackageVersion(): Promise<string> {
  const { dependencies } = await readJson('frontend/package.json');
  return dependencies['@sheetbase/models'].replace('~', '').replace('^', '');
}

export async function loadProjectModels(): Promise<{[name: string]: Model}> {
  // built-in models
  let builtinModels: {[name: string]: Model} = {};
  const { models: configBuiltinModels } = await getSheetbaseDotJson();
  if (!!configBuiltinModels) {
    builtinModels = await getBuiltinModels(
      configBuiltinModels,
      await getModelsPackageVersion(),
    );
  }
  // load models in 'models' folder
  const modelsPath = resolve('models');
  let localModels: {[name: string]: Model} = {};
  if (await pathExists(modelsPath)) {
    const filePaths = (await readdirAsync(modelsPath)).map(path => modelsPath + '/' + path);
    localModels = await getLocalModels(filePaths);
  }
  // all project models
  return { ... builtinModels, ... localModels };
}

export async function getBuiltinModels(
  items: Array<string | ModelExtended>,
  version = 'latest',
): Promise<{[name: string]: Model}> {
  const models = {};
  // fetcher
  const fetcher = async (name: string) => {
    const url = `https://unpkg.com/@sheetbase/models@${ version }/models/${ name }.json`;
    return await getData(url);
  };
  // get models
  for (let i = 0; i < items.length; i++) {
    const builtInModel = items[i];
    // retrieve name
    let modelName = (typeof builtInModel === 'string') ? builtInModel : builtInModel.from;
    // get data
    let data: ModelSchema[] | Model = await fetcher(modelName);
    if (data instanceof Array) {
      data = { gid: null, schema: data };
    }
    // extends
    if (builtInModel instanceof Object) {
      const { name, gid, public: isPublic } = builtInModel;
      modelName = name; // rename
      data.gid = gid; // change gid
      if (isPublic) {
        data.public = true; // override public
      } else if (!isPublic && !!data.public) {
        delete data.public; // remove public
      }
    }
    // save to builtin
    models[modelName] = data;
  }
  return models;
}

export async function getLocalModels(
  filePaths: string[],
): Promise<{[name: string]: Model}> {
  const models = {};
  for (let i = 0; i < filePaths.length; i++) {
    const filePath = filePaths[i].replace(/\\/g, '/');
    const modelName = filePath.split('/').pop().replace('.json', '');
    const data: ModelSchema[] | Model = await readJson(resolve(filePath));
    models[modelName] = (data instanceof Array) ? { gid: null, schema: data } : data;
  }
  return models;
}

export async function getRemoteModels(
  urls: string[],
): Promise<{[name: string]: Model}> {
  const models = {};
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const modelName = url.split('/').pop().replace('.json', '');
    const data: ModelSchema[] | Model = await getData(url);
    models[modelName] = (data instanceof Array) ? { gid: null, schema: data } : data;
  }
  return models;
}
