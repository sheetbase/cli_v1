import { getOAuth2Client } from '../../services/google';
import { createSheetBySchema } from '../../services/spreadsheet';
import { getBackendConfigs } from '../../services/project';
import { logError, logOk, logAction } from '../../services/message';

import { getModels, getAvailableModels } from './project-models';
import { Options } from './project';

export async function projectModelCommand(filePaths: string[], options: Options) {
    // load default google account
    const googleClient = await getOAuth2Client();
    if (!googleClient) {
        return logError('PROJECT_MODEL__ERROR__NO_GOOGLE_ACCOUNT');
    }

    // get databaseId
    const databaseId = options.database || (await getBackendConfigs()).databaseId;
    if (!databaseId) {
        return logError('PROJECT_MODEL__ERROR__NO_DATABASE');
    }

    // load schemas
    let models = {};
    if (filePaths.length > 0) {
        models = await getModels(filePaths);
    } else {
        models = await getAvailableModels();
    }

    // send request
    for (const key of Object.keys(models)) {
        await logAction('Create model: ' + key, async () => {
            await createSheetBySchema(
                googleClient, databaseId, key, models[key],
            );
        });
    }

    // done
    logOk('PROJECT_MODEL__OK');
}