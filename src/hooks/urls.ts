import { getHook, CLIHook } from './index';

import {
    getConfigs,
    getBackendConfigs,
    getFrontendConfigs,
} from '../services/project';

export async function urlsHook(data?: {}) {
    const hook: CLIHook = await getHook('urls');
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
