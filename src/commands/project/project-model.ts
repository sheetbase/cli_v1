import { getOAuth2Client } from '../../services/google';
import { createSheetByModel, deleteDefaultSheet } from '../../services/spreadsheet';
import { getBackendConfigs, getFrontendConfigs, setConfigs } from '../../services/project';
import { logError, logOk, logAction } from '../../services/message';
import { Model, getLocalModels, loadModels } from '../../services/model';

import { Options } from './project';

export async function projectModelCommand(schemaFiles: string[], options: Options) {
    // load default google account
    const googleClient = await getOAuth2Client();
    if (!googleClient) {
        return logError('GOOGLE__ERROR__NO_ACCOUNT');
    }

    // get databaseId
    const databaseId = options.database || (await getBackendConfigs()).databaseId;
    if (!databaseId) {
        return logError('PROJECT_MODEL__ERROR__NO_DATABASE');
    }

    // load models
    const { databaseGids } = await getFrontendConfigs();
    let allModels: {[name: string]: Model};
    const newModels: {[name: string]: Model} = {};
    await logAction('Load models', async () => {
        // load models
        allModels = await loadModels();
        if (schemaFiles.length > 0) {
            const customModels = await getLocalModels(schemaFiles);
            allModels = { ... allModels, ... customModels };
        }
        // assign gid if not defined
        // and check for duplication
        const gids = {};
        // models
        for (const key of Object.keys(allModels)) {
            const gid = allModels[key].gid;
            if (!gid) {
                allModels[key].gid = Math.round(Math.random() * 1E9);
                gids[allModels[key].gid] = key;
            } else if (!!gids[gid]) {
                return logError('PROJECT_MODEL__ERROR__DUPLICATE_GID', true, [
                    key, gids[gid],
                ]);
            } else {
                gids[gid] = key;
            }
            // new models
            if (!!databaseGids && !databaseGids[key]) {
                newModels[key] = allModels[key];
            }
        }
    });

    // send request
    await logAction('Create sheet:', async () => {
        for (const key of Object.keys(newModels)) {
            await createSheetByModel(
                googleClient, databaseId, key, newModels[key],
            );
            console.log('   + ' + key);
        }
    });

    // delete the default 'Sheet1'
    if (options.clean) {
        await logAction('Remove the default sheet', async () => {
            await deleteDefaultSheet(googleClient, databaseId);
        });
    }

    // save gid maps to config
    await logAction('Save public sheet gids', async () => {
        const databaseGids = {};
        for (const key of Object.keys(allModels)) {
            const model = allModels[key];
            if (model.public) {
                databaseGids[key] = '' + model.gid;
            }
        }
        // save to configs
        await setConfigs({ databaseGids });
    });

    // done
    logOk('PROJECT_MODEL__OK');
}