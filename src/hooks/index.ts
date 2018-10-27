import { resolve } from 'path';
import { pathExists } from 'fs-extra';

import { getPath } from '../services/project/project.service';

export { setupHook } from './setup';
export { configHook } from './config';
export { urlsHook } from './urls';

export interface CLIHook {
    (data?: any, vendors?: any): any;
}

export interface CLIHooks {
    [name: string]: CLIHook;
}

export async function hasHooks(path?: string): Promise<boolean> {
    const hooks = await getHooks(path);
    if (hooks && Object.keys(hooks).length > 0) {
        return true;
    }
    return false;
}

export async function getHooks(path?: string): Promise<CLIHooks> {
    let hooks: CLIHooks;
    try {
        const projectPath: string = await getPath(path);
        const hooksPath = `${projectPath}/hooks/index.js`;
        if (!await pathExists(hooksPath)) {
            throw new Error('No hooks');
        }
        hooks = require(resolve('.', hooksPath));
    } catch (error) {
        hooks = {};
    }
    return hooks;
}

export async function getHook(name: string): Promise<CLIHook> {
    const hooks: CLIHooks = await getHooks();
    return hooks[name];
}
