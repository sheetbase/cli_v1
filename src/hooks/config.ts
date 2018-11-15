import { getHook, CLIHook } from './index';

import {
    getConfigs,
    getBackendConfigs,
    getFrontendConfigs,
} from '../services/project';

export async function configHook(data?: {}) {
    const hook: CLIHook = await getHook('config');
    let hookResult: {};
    if (hook) {
        hookResult = await hook(
            data,
            {
                getConfigs,
                getBackendConfigs,
                getFrontendConfigs,
            },
        );
    }
    return hookResult || {};
}
