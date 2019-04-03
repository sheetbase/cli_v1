import { getOAuth2Client } from '../../services/google';
import { createSheetByModel, deleteDefaultSheet } from '../../services/spreadsheet';
import { getBackendConfigs, setFrontendConfigs } from '../../services/project';
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
    let projectModels: {[name: string]: Model};
    let customModels: {[name: string]: Model};
    let models: {[name: string]: Model};
    await logAction('Load models', async () => {
        projectModels = await loadModels();
        if (schemaFiles.length > 0) {
            customModels = await getLocalModels(schemaFiles);
        }
        // assign gid if not defined
        // and check for duplication
        const gids = {};
        // project models
        for (const key of Object.keys(projectModels)) {
            const gid = projectModels[key].gid;
            if (!gid) {
                projectModels[key].gid = Math.round(Math.random() * 1E9);
                gids[projectModels[key].gid] = key;
            } else if (!!gids[gid]) {
                return logError('PROJECT_MODEL__ERROR__DUPLICATE_GID', true, [
                    key, gids[gid],
                ]);
            } else {
                gids[gid] = key;
            }
        }
        // custom models
        if (!!customModels) {
            for (const key of Object.keys(customModels)) {
                const gid = customModels[key].gid;
                if (!gid) {
                    customModels[key].gid = Math.round(Math.random() * 1E9);
                    gids[customModels[key].gid] = key;
                } else if (!!gids[gid]) {
                    return logError('PROJECT_MODEL__ERROR__DUPLICATE_GID', true, [
                        key, gids[gid],
                    ]);
                } else {
                    gids[gid] = key;
                }
            }
        }
        // get active models (will be used to create new sheets)
        models = !!customModels ? customModels : projectModels;
    });

    // send request
    for (const key of Object.keys(models)) {
        await logAction('Create sheet: ' + key, async () => {
            await createSheetByModel(
                googleClient, databaseId, key, models[key],
            );
        });
    }

    // delete the default 'Sheet1'
    if (options.clean) {
        await logAction('Remove the default sheet', async () => {
            await deleteDefaultSheet(googleClient, databaseId);
        });
    }

    // save gid maps to config
    const databaseGids = {};
    await logAction('Save public sheet gids', async () => {
        const allModels = { ... projectModels, ... customModels };
        for (const key of Object.keys(allModels)) {
            const model = allModels[key];
            if (model.public) {
                databaseGids[key] = '' + model.gid;
            }
        }
        // save to configs
        await setFrontendConfigs({ databaseGids });
    });

    // done
    logOk('PROJECT_MODEL__OK');
}