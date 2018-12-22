import { pathExists, readJson } from 'fs-extra';

import { setBackendConfigs, setFrontendConfigs } from '../../services/project';
import { logError, logOk } from '../../services/message';

export async function projectConfigImportCommand(params: string[]) {
    const [ jsonFilePath ] = params;

    // load data
    if (!jsonFilePath || !await pathExists(jsonFilePath)) {
        return logError('PROJECT_CONFIG_IMPORT__ERROR__NO_FILE');
    }

    // set data
    const { backend, frontend } = await readJson(jsonFilePath);
    await setBackendConfigs(backend);
    await setFrontendConfigs(frontend);

    // done
    logOk('PROJECT_CONFIG_IMPORT__OK', true);
}