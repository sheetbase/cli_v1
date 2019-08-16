import { basename } from 'path';
import { titleCase } from 'change-case';

import { driveCreateFolder } from '../../services/drive';
import { gasCreate, gasWebappInit } from '../../services/gas';
import { getOAuth2Client } from '../../services/google';
import {
    setInitialConfigs,
    getSheetbaseDotJson,
    setSheetbaseDotJson,
    setConfigs,
} from '../../services/project';
import { setClaspConfigs, getClaspConfigs } from '../../services/clasp';
import { logError, logWarn, logOk, logAction } from '../../services/message';

import { BuiltinHooks } from '../../hooks';

import { Options } from './project';

export async function projectSetupCommand(options: Options) {
    const name = basename(process.cwd());
    const namePretty = titleCase(name);

    // load default google account
    const googleClient = await getOAuth2Client();
    if (!googleClient) {
        return logError('PROJECT_SETUP__ERROR__NO_GOOGLE_ACCOUNT', true, [name]);
    }

    // clear configs
    if (options.reSetup) {
        await logAction('Reset configs', async () => {
            await setInitialConfigs(name);
        });
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
        await logAction('Create the Drive folder', async () => {
            driveFolder = await driveCreateFolder(googleClient, `Sheetbase: ${namePretty}`);
            await setSheetbaseDotJson({ driveFolder });
        });
    }

    // backend
    if (!scriptId) {
        await logAction('Create the backend script', async () => {
            scriptId = await gasCreate(googleClient, `${namePretty} Backend`, driveFolder);
            await setClaspConfigs({ scriptId }, true);
        });

        // deploy backend
        if (!backendUrl) {
            await logAction('Initial deploy the backend', async () => {
                const { url } = await gasWebappInit(googleClient, scriptId);
                backendUrl = url;
                await setConfigs({ backendUrl });
            });
        }
    }

    // hooks
    if (!!setupHooks) {
        const builtinHooks = new BuiltinHooks({
            googleClient,
            driveFolder,
            projectName: name,
        });
        const newConfigs = {};
        for (const key of Object.keys(setupHooks)) {
            if (!backend[key] && !frontend[key]) { // not exists in configs
                const [ description, hookName, ... args ] = setupHooks[key];
                await logAction(description, async () => {
                    try {
                        newConfigs[key] = await builtinHooks[hookName](... args);
                    } catch (error) {
                        logWarn('PROJECT_SETUP__WARN__HOOK_ERROR', false, [error]);
                    }
                });
            }
        }
        await setConfigs(newConfigs);
    }

    // done
    logOk('PROJECT_SETUP__OK', true);
}