import { buildKeyValueFromParams } from '../../services/utils';
import { setConfigs } from '../../services/project';
import { LOG, ERROR, logError } from '../../services/message';

import { configHook } from '../../hooks';

import { Options } from './project';

export async function projectConfigUpdateCommand(params: string[], options: Options) {
    if ((params || []).length <= 0) {
        return logError(ERROR.CONFIG_NO_VALUE);
    }
    try {
        const inputConfigs = buildKeyValueFromParams(params);
        await setConfigs(inputConfigs);
    } catch (error) {
        return logError(ERROR.CONFIG_UPDATE_FAILS);
    }
    // hook
    try {
        if (options.trusted && options.hook) {
            await configHook();
        }
    } catch (error) {
        return logError(ERROR.HOOK_ERROR(error));
    }
    console.log(LOG.CONFIG_UPDATE);
    return process.exit();
}