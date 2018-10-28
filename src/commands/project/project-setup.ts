import { OAuth2Client } from 'google-auth-library';
import { sentenceCase } from 'change-case';

import { getCurrentDirectoryBase } from '../../services/utils/utils.service';
import { driveCreateFolder } from '../../services/drive/drive.service';
import { gasCreate, gasWebappInit } from '../../services/gas/gas.service';
import { getOAuth2Client } from '../../services/google/google.service';
import { setSheetbaseDotJson, setPackageDotJson, setConfigs } from '../../services/project/project.service';
import { setClaspConfigs } from '../../services/clasp/clasp.service';
import { LOG, ERROR, logError, logWait } from '../../services/message/message.service';

import { setupHook } from '../../hooks/setup';

import { Options } from './project';

export async function projectSetupCommand(options: Options) {
    const name: string = getCurrentDirectoryBase();

    const googleClient: OAuth2Client = await getOAuth2Client();
    if (!googleClient) {
        return logError(ERROR.GOOGLE_NO_ACCOUNT);
    }

    try {
        // generate configs
        logWait(`Setup the project`);
        const driveFolder = await driveCreateFolder(
            googleClient, `Sheetbase Project: ${sentenceCase(name)}`,
        );
        const scriptId = await gasCreate(
            googleClient, `${sentenceCase(name)} Backend`, driveFolder,
        );
        await setPackageDotJson({ name, version: '1.0.0', description: 'A Sheetbase project' }, true);
        await setSheetbaseDotJson({ cloudId: '', driveFolder });
        await setClaspConfigs({ scriptId }, true);

        // init deploy backend
        const { url } = await gasWebappInit(googleClient, scriptId);
        await setConfigs({ backendUrl: url });
    } catch (error) {
        return logError(error);
    }

    // hook
    try {
        if (options.hook) {
            await setupHook();
        }
    } catch (error) {
        return logError(ERROR.HOOK_ERROR(error));
    }

    console.log('\n ' + LOG.PROJECT_SETUP);
    return process.exit();
}