import { resolve } from 'path';
import {
    pathExists,
    readJson as fsReadJson,
    writeJson as fsWriteJson,
    outputFile as fsOutputFile,
} from 'fs-extra';
import { merge } from 'lodash';

export const SHEETBASE_DOT_JSON_PATH = 'sheetbase.json';
export const PACKAGE_DOT_JSON_PATH = 'package.json';
export const BACKEND_CONFIG_PATH = 'backend/src/sheetbase.config.ts';
export const FRONTEND_CONFIG_PATH = 'frontend/src/sheetbase.config.ts';

export interface SheetbaseDotJson {
    cloudId?: string;
    driveFolder?: string;
    configMaps?: {
        frontend?: string[];
        backend?: string[];
    };
    configs?: {
        frontend?: {};
        backend?: {};
    };
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
}

export async function readJson(file: string) {
    const projectPath: string = await getPath();
    return await fsReadJson(`${projectPath}/${file}`);
}

export async function writeJson(file: string, data: any, override?: boolean) {
    if (!(data instanceof Object)) {
        throw new Error('Data must be an object.');
    }
    const projectPath: string = await getPath();
    if (!override) {
        const d = await readJson(file);
        data = merge(d, data);
    }
    await fsWriteJson(`${projectPath}/${file}`, data, { spaces: '\t' });
    return data;
}

export async function outputFile(file: string, content: string): Promise<void> {
    const projectPath: string = await getPath();
    await fsOutputFile(`${projectPath}/${file}`, content);
}

export async function getPath(path?: string): Promise<string> {
    let root: string;
    if (path && await pathExists(`${path}/${SHEETBASE_DOT_JSON_PATH}`)) {
        root = path;
    } else if (await pathExists(`./${SHEETBASE_DOT_JSON_PATH}`)) {
        root = '.';
    } else if (await pathExists(`../${SHEETBASE_DOT_JSON_PATH}`)) {
        root = '..';
    } else {
        throw new Error('Not a valid project.');
    }
    return resolve(root);
}

export async function isValid(path?: string): Promise<boolean> {
    try {
        await getPath(path);
    } catch (error) {
        return false;
    }
    return true;
}

export async function getSheetbaseDotJson(): Promise<SheetbaseDotJson> {
    return await readJson(SHEETBASE_DOT_JSON_PATH);
}

export async function setSheetbaseDotJson(
    data: SheetbaseDotJson, override?: boolean,
): Promise<SheetbaseDotJson> {
    return await writeJson(SHEETBASE_DOT_JSON_PATH, data, override);
}

export async function getPackageDotJson(): Promise<PackageDotJson> {
    return await readJson(PACKAGE_DOT_JSON_PATH);
}

export async function setPackageDotJson(
    data: PackageDotJson, override?: boolean,
): Promise<PackageDotJson> {
    return await writeJson(PACKAGE_DOT_JSON_PATH, data, override);
}

export async function getConfigs() {
    const { configs } = await getSheetbaseDotJson();
    return configs || {};
}

export async function setConfigs(data: {}) {
    // get configs
    const { backend, frontend } = await getConfigs();
    // get maps
    const { configMaps } = await getSheetbaseDotJson();
    const backendFields = configMaps.backend;
    const frontendFields = configMaps.frontend;
    // set configs
    for (const key of Object.keys(data)) {
        if ((backendFields || []).includes(key)) {
            backend[key] = data[key];
        } else if ((frontendFields || []).includes(key)) {
            frontend[key] = data[key];
        }
    }
    const { configs } = await setSheetbaseDotJson({
        configs: { backend, frontend },
    });
    // save to file
    let content = 'export const SHEETBASE_CONFIG = ';
    if (Object.keys(backend).length > 0) {
        content = content + JSON.stringify(backend, null, '\t');
        await outputFile(BACKEND_CONFIG_PATH, content);
    }
    if (Object.keys(frontend).length > 0) {
        content = content + JSON.stringify(frontend, null, '\t');
        await outputFile(FRONTEND_CONFIG_PATH, content);
    }
    return configs;
}

export async function getBackendConfigs() {
    const { backend } = await getConfigs();
    return backend || {};
}

export async function setBackendConfigs(data: {}) {
    const { backend } = await setConfigs(data);
    return backend;
}

export async function getFrontendConfigs() {
    const { frontend } = await getConfigs();
    return frontend || {};
}

export async function setFrontendConfigs(data: {}) {
    const { frontend } = await setConfigs(data);
    return frontend;
}

export function buildUrls(configs?: any) {
    const { scriptId, backendUrl, driveFolder, projectId } = configs;
    const result: any = {};
    if (driveFolder) {
        result['drive'] = `https://drive.google.com/drive/folders/${driveFolder}`;
    }
    if (backendUrl) {
        result['backend'] = backendUrl;
    }
    if (scriptId) {
        result['script'] = `https://script.google.com/d/${scriptId}/edit`;
    }
    if (projectId) {
        result['gcp'] = `https://console.cloud.google.com/home/dashboard?project=${projectId}`;
    }
    return result;
}