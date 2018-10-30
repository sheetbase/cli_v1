import { pathExists, readJson } from 'fs-extra';

import { setBackendConfigs, setFrontendConfigs } from '../../services/project/project.service';
import { configHook } from '../../hooks';
import { LOG, ERROR, logError } from '../../services/message/message.service';

import { Options } from './project';

export async function projectConfigImportCommand(params: string[], options: Options) {
    // load data
    const [ jsonFilePath ] = params;
    if (!jsonFilePath || !await pathExists(jsonFilePath)) {
        return logError(ERROR.CONFIG_IMPORT_NO_FILE);
    }
    // set data
    try {
        const { backend, frontend } = await readJson(jsonFilePath);
        await setBackendConfigs(backend);
        await setFrontendConfigs(frontend);
    } catch (error) {
        return logError(ERROR.CONFIG_IMPORT_FAILS);
    }
    // hook
    try {
        if (options.trusted && options.hook) {
            await configHook();
        }
    } catch (error) {
        return logError(ERROR.HOOK_ERROR(error));
    }
    console.log(LOG.CONFIG_IMPORT);
    return process.exit();
}