import { sentenceCase } from 'change-case';

import { getCurrentDirectoryBase } from '../../services/utils';
import { driveCreateFolder } from '../../services/drive';
import { gasCreate, gasWebappInit } from '../../services/gas';
import { getOAuth2Client } from '../../services/google';
import { getSheetbaseDotJson, setSheetbaseDotJson, setConfigs } from '../../services/project';
import { setClaspConfigs, getClaspConfigs } from '../../services/clasp';
import { logError, logWarn, logOk, logAction } from '../../services/message';

import { BuiltinHooks } from '../../hooks';

export async function projectSetupCommand() {
    const name = getCurrentDirectoryBase();
    const nameSentenceCase = sentenceCase(name);

    // load default google account
    const googleClient = await getOAuth2Client();
    if (!googleClient) {
        return logError('PROJECT_SETUP__ERROR__NO_GOOGLE_ACCOUNT');
    }

    // load current configs
    let {
        driveFolder,
        configs: { frontend: { backendUrl = null } = {}} = {},
        // tslint:disable-next-line:prefer-const
        setupHooks, configs: { backend = {}, frontend = {}} = {},
    } = await getSheetbaseDotJson();
    let { scriptId } = await getClaspConfigs();

    // drive folder
    if (!driveFolder) {
        await logAction('Create drive folder', async () => {
            driveFolder = await driveCreateFolder(googleClient, `Sheetbase Project: ${nameSentenceCase}`);
            await setSheetbaseDotJson({ driveFolder });
        });
    }

    // backend script
    if (!scriptId) {
        await logAction('Create backend script', async () => {
            scriptId = await gasCreate(googleClient, `${nameSentenceCase} Backend`, driveFolder);
            await setClaspConfigs({ scriptId }, true);
        });
    }

    // deploy backend
    if (!backendUrl) {
        await logAction('Initial deploy the backend', async () => {
            const { url } = await gasWebappInit(googleClient, scriptId);
            backendUrl = url;
            await setConfigs({ backendUrl });
        });
    }

    /**
     * app configs
     */
    if (!!setupHooks) {
        const builtinHooks = new BuiltinHooks({ googleClient, driveFolder });
        const currentConfigs = { ... backend, ... frontend };
        const newConfigs = {};
        await logAction('Run hooks', async () => {
            for (const key of Object.keys(setupHooks)) {
                if (!currentConfigs[key]) {
                    const [ hookName, ... args ] = setupHooks[key];
                    try {
                        newConfigs[key] = await builtinHooks[hookName](... args);
                    } catch (error) {
                        logWarn('PROJECT_SETUP__WARN__HOOK_ERROR', false, [error]);
                    }
                }
            }
            await setConfigs(newConfigs);
        });
    }

    // done
    logOk('PROJECT_SETUP__OK', true);
}