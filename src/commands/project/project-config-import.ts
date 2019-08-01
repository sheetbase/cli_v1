import { resolve } from 'path';
import { pathExists, readJson } from 'fs-extra';

import { setBackendConfigs, setFrontendConfigs } from '../../services/project';
import { logError, logOk } from '../../services/message';

export async function projectConfigImportCommand(path: string) {

    // load data
    if (!path || ! await pathExists(path)) {
        return logError('PROJECT_CONFIG_IMPORT__ERROR__NO_FILE');
    }

    // set data
    const { backend, frontend } = await readJson(resolve(path));
    await setBackendConfigs(backend);
    await setFrontendConfigs(frontend);

    // done
    logOk('PROJECT_CONFIG_IMPORT__OK', true);
}