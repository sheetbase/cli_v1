import { buildKeyValueFromParams } from '../../services/utils';
import { getConfigs, setConfigs, setBackendConfigs, setFrontendConfigs } from '../../services/project';
import { logOk } from '../../services/message';

export async function projectConfigUpdateCommand(params: string[]) {
    // set configs
    if (!!params && params.length > 0) {
        await setConfigs(buildKeyValueFromParams(params));
    }

    // update configs
    else {
        // load configs from sheetbase.json
        const { backend, frontend } = await getConfigs();
        await setBackendConfigs(backend);
        await setFrontendConfigs(frontend);
    }

    // done
    logOk('PROJECT_CONFIG_UPDATE__OK', true);
}