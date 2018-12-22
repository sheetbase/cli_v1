import { OAuth2Client } from 'google-auth-library';
import { sentenceCase } from 'change-case';

import { getCurrentDirectoryBase } from '../../services/utils';
import { driveCreateFolder } from '../../services/drive';
import { gasCreate, gasWebappInit } from '../../services/gas';
import { getOAuth2Client } from '../../services/google';
import {
    getSheetbaseDotJson,
    setSheetbaseDotJson,
    setConfigs,
} from '../../services/project';
import { setClaspConfigs } from '../../services/clasp';
import { logError, logWarn, logOk } from '../../services/message';

import { BuiltinHooks } from '../../hooks';

export async function projectSetupCommand() {
    const name = getCurrentDirectoryBase();
    const nameSentenceCase = sentenceCase(name);

    // load default google account
    const googleClient: OAuth2Client = await getOAuth2Client();
    if (!googleClient) {
        return logError('PROJECT_SETUP_NO_GOOGLE_ACCOUNT');
    }

    /**
     * system configs
     */
    // generate  system configs
    const driveFolder = await driveCreateFolder(
        googleClient,
        `Sheetbase Project: ${nameSentenceCase}`,
    );
    const scriptId = await gasCreate(
        googleClient,
        `${nameSentenceCase} Backend`,
        driveFolder,
    );

    // save system configs
    await setSheetbaseDotJson({ driveFolder });
    await setClaspConfigs({ scriptId }, true);

    /**
     * app configs
     */
    const configs = {};

    // init deploy backend
    const { url: backendUrl } = await gasWebappInit(googleClient, scriptId);
    configs[backendUrl] = backendUrl;

    // run hooks
    const { setupHooks } = await getSheetbaseDotJson();
    if (!!setupHooks) {
        // create new hooks instance
        const builtinHooks = new BuiltinHooks({ googleClient, driveFolder });
        // run hook
        for (const key of Object.keys(setupHooks)) {
            const [ hookName, ... args ] = setupHooks[key];
            try {
                configs[key] = await builtinHooks[hookName](... args);
            } catch (error) {
                logWarn(`Error running hook "${hookName}": ` + error);
            }
        }
    }

    // save configs
    await setConfigs(configs);

    // done
    logOk('PROJECT_SETUP', true, [`https://script.google.com/d/${scriptId}/edit?usp=drive_web`]);
}