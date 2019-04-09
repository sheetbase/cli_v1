import { getOAuth2Client } from '../../services/google';
import { getSheets, createSheetByModel, deleteDefaultSheet } from '../../services/spreadsheet';
import { getBackendConfigs, getFrontendConfigs, setConfigs } from '../../services/project';
import { logError, logOk, logAction } from '../../services/message';
import { Model, getLocalModels, loadModels } from '../../services/model';

import { Options } from './project';

export async function projectModelCommand(schemaFiles: string[], options: Options) {
    let allModels: {[name: string]: Model};

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
    await logAction('Load models', async () => {
        // load project models
        allModels = await loadModels();
        // load custom files
        if (schemaFiles.length > 0) {
            const customModels = await getLocalModels(schemaFiles);
            allModels = { ... allModels, ... customModels };
        }
        // assign gid if not defined
        // and check for duplication
        const existingGids = {};
        for (const key of Object.keys(allModels)) {
            const gid = allModels[key].gid;
            if (!gid) {
                allModels[key].gid = Math.round(Math.random() * 1E9);
                existingGids[allModels[key].gid] = key;
            } else if (!!existingGids[gid]) {
                return logError('PROJECT_MODEL__ERROR__DUPLICATE_GID', true, [
                    key, existingGids[gid],
                ]);
            } else {
                existingGids[gid] = key;
            }
        }
    });

    // send request
    await logAction('Create sheet:', async () => {
        const existingSheets = await getSheets(googleClient, databaseId);
        const skippedSheets = [];
        for (const key of Object.keys(allModels)) {
            if (!existingSheets[key]) {
                await createSheetByModel(
                    googleClient, databaseId, key, allModels[key],
                );
                console.log('   + ' + key);
            } else {
                skippedSheets.push(key);
            }
        }
        console.log('\n   Skipped: ' + skippedSheets.join(', '));
    });

    // delete the default 'Sheet1'
    if (options.clean) {
        await logAction('Remove the default sheet', async () => {
            await deleteDefaultSheet(googleClient, databaseId);
        });
    }

    // save gid maps to config
    await logAction('Save public sheet ids', async () => {
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