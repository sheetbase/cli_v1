import { EOL } from 'os';
import { resolve } from 'path';
import {
  pathExists,
  readJson as fsReadJson,
  writeJson as fsWriteJson,
  outputFile as fsOutputFile,
} from 'fs-extra';
import { merge } from 'lodash';

import { setClaspConfigs } from './clasp';

export const SHEETBASE_DOT_JSON = 'sheetbase.json';
export const PACKAGE_DOT_JSON = 'package.json';
export const BACKEND_CONFIG_FILE = 'backend/src/sheetbase.config.ts';
export const FRONTEND_CONFIG_FILE = 'frontend/src/sheetbase.config.ts';

export interface GithubProvider {
  gitUrl: string;
  master?: boolean;
}

export interface Deployment {
  provider: 'github' | 'firebase' | 'hosting' | 'server';
  destination: any | GithubProvider;
  url?: string;
  wwwDir?: string;
  stagingDir?: string;
}

export interface ModelExtended {
  from: string;
  name: string;
  gid: string | number;
  public?: boolean;
}

export interface SheetbaseDotJson {
  projectId?: string;
  configs?: {
    frontend?: {
      backendUrl?: string;
      [key: string]: any;
    };
    backend?: {
      [key: string]: any;
    };
  };
  configMaps?: {
    frontend?: string[];
    backend?: string[];
  };
  urlMaps?: {
    [configKey: string]: string[];
  };
  setupHooks?: {
    [configKey: string]: any[];
  };
  models?: Array<string | ModelExtended>;
  deployment?: Deployment;
}

export interface PackageDotJson {
  name: string;
  version?: string;
  description?: string;
  author?: string;
  homepage?: string;
  license?: string;
  repository?: {
    type: string;
    url: string;
  };
  bugs?: {
    url: string;
  };
  scripts?: {
    [script: string]: string;
  };
}

/**
 * utils
 */

export async function getPath(...paths: string[]) {
  const [customRoot, ...children] = paths;
  let root = customRoot;
  if (!customRoot) {
    if (await pathExists(`./${SHEETBASE_DOT_JSON}`)) {
      root = '.';
    } else if (await pathExists(`../${SHEETBASE_DOT_JSON}`)) {
      root = '..';
    }
  }
  return !!root ? resolve(root, ...children) : '';
}

export async function isValid(customRoot?: string) {
  return !! await getPath(customRoot);
}

/**
 * file
 */

export async function readJson(file: string, customRoot?: string) {
  return await fsReadJson(await getPath(customRoot, file));
}

export async function writeJson<Data>(
  file: string,
  data: Data,
  modifier?: boolean | { (currentData: Data, data: Data): Data },
  customRoot?: string,
) {
  const filePath = await getPath(customRoot, file);
  // prepare the data
  if (
    !modifier ||
    (!!modifier && modifier instanceof Function)
  ) {
    const currentData = await fsReadJson(filePath);
    if (!!modifier) {
      data = (modifier as any)(currentData, data);
    } else {
      data = merge(currentData, data);
    }
  }
  // save data
  await fsWriteJson(filePath, data, { spaces: 2 });
}

export async function outputFile(file: string, content: string, customRoot?: string) {
  await fsOutputFile(await getPath(customRoot, file), content);
}

/**
 * sheetbase.json
 */

export async function getSheetbaseDotJson(customRoot?: string): Promise<SheetbaseDotJson> {
  return await readJson(SHEETBASE_DOT_JSON, customRoot);
}

export async function setSheetbaseDotJson(
  data: SheetbaseDotJson,
  modifier?: boolean | {
    (currentData: SheetbaseDotJson, data: SheetbaseDotJson): SheetbaseDotJson;
  },
  customRoot?: string,
) {
  await writeJson(SHEETBASE_DOT_JSON, data, modifier, customRoot);
}

/**
 * package.json
 */

export async function getPackageDotJson(customRoot?: string): Promise<PackageDotJson> {
  return await readJson(PACKAGE_DOT_JSON, customRoot);
}

export async function setPackageDotJson(
  data: PackageDotJson,
  modifier?: boolean | {
    (currentData: PackageDotJson, data: PackageDotJson): PackageDotJson;
  },
  customRoot?: string,
) {
  await writeJson(PACKAGE_DOT_JSON, data, modifier, customRoot);
}

/**
 * config (general)
 */

export async function getConfigs(customRoot?: string) {
  const { configs } = await getSheetbaseDotJson(customRoot);
  return configs || {};
}

export async function setConfigs(data: {}, customRoot?: string) {
  // load configs and config maps
  const { backend, frontend } = await getConfigs(customRoot);
  const {
    configMaps: { backend: backendFields = [], frontend: frontendFields = [] } = {},
  } = await getSheetbaseDotJson(customRoot);
  // sort out configs
  for (const key of Object.keys(data)) {
    if ((backendFields || []).includes(key)) {
      backend[key] = data[key];
    }
    if ((frontendFields || []).includes(key)) {
      frontend[key] = data[key];
    }
  }
  // save to sheetbase.json
  await setSheetbaseDotJson({ configs: { backend, frontend } }, false, customRoot);
  // save to files
  await saveBackendConfigs(backend, customRoot);
  await saveFrontendConfigs(frontend, customRoot);
}

export async function resetConfigs(name: string, customRoot?: string) {
  const deployPath = await getPath(customRoot);
  // package.json
  await setPackageDotJson(
    {
      name,
      version: '1.0.0',
      description: 'A Sheetbase project',
    },
    (currentData, data) => {
      // keep only these fields
      const { author, homepage, license, scripts } = currentData;
      return { ...data, author, homepage, license, scripts };
    },
    deployPath,
  );
  // sheetbase.json
  await setSheetbaseDotJson(
    {
      projectId: '',
      configs: {
        backend: {},
        frontend: {},
      },
      deployment: null,
    },
    // override above fields and keep the rest
    (currentData, data) => ({ ...currentData, ...data }),
    deployPath,
  );
  // backend/.clasp.json
  await setClaspConfigs({ scriptId: '' }, true, deployPath);
}

export async function saveConfigs(filePath: string, data: {}, customRoot?: string) {
  let content = '' +
    '// Please do NOT edit this file directlly' + EOL +
    '// To synchronize set/update project configs:' + EOL +
    '// + From terminal, run $ sheetbase config set key=value|...' + EOL +
    '// + Or, edit configs in sheetbase.json, then run $ sheetbase config update' + EOL +
    'export const SHEETBASE_CONFIG = ';
  content = content + JSON.stringify(data, null, 2) + ';' + EOL;
  await outputFile(filePath, content, customRoot);
}

/**
 * config (backend)
 */

export async function getBackendConfigs(customRoot?: string) {
  const { backend } = await getConfigs(customRoot);
  return backend || {};
}

export async function setBackendConfigs(data: {}, customRoot?: string) {
  await setConfigs(data, customRoot);
}

export async function saveBackendConfigs(data: {}, customRoot?: string) {
  await saveConfigs(BACKEND_CONFIG_FILE, data, customRoot);
}

/**
 * config (frontend)
 */

export async function getFrontendConfigs(customRoot?: string) {
  const { frontend } = await getConfigs(customRoot);
  return frontend || {};
}

export async function setFrontendConfigs(data: {}, customRoot?: string) {
  await setConfigs(data, customRoot);
}

export async function saveFrontendConfigs(data: {}, customRoot?: string) {
  await saveConfigs(FRONTEND_CONFIG_FILE, data, customRoot);
}
