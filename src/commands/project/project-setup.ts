import { execSync } from 'child_process';
import { OAuth2Client } from 'google-auth-library';
import { sentenceCase } from 'change-case';

import { getCurrentDirectoryBase } from '../../services/utils/utils.service';
import { driveCreateFolder } from '../../services/drive/drive.service';
import { gasCreate, gasWebappInit } from '../../services/gas/gas.service';
import { getOAuth2Client } from '../../services/google/google.service';
import { setSheetbaseDotJson, setPackageDotJson, setConfigs } from '../../services/project/project.service';
import { setClaspConfigs } from '../../services/clasp/clasp.service';
import { warn, LOG, ERROR, logError, logWait } from '../../services/message/message.service';

import { setupHook } from '../../hooks/setup';

import { Options } from './project';

export async function projectSetupCommand(options: Options) {
    const name: string = getCurrentDirectoryBase();

    const googleClient: OAuth2Client = await getOAuth2Client();
    if (!googleClient) {
        return logError(ERROR.GOOGLE_NO_ACCOUNT);
    }

    // trust warning
    console.log(`${warn} Only apply --trusted flag to original and trusted theme.`);

    let driveFolder: string;
    let scriptId: string;
    try {
        // generate configs
        logWait(`Setup the project`);
        driveFolder = await driveCreateFolder(
            googleClient, `Sheetbase Project: ${sentenceCase(name)}`,
        );
        scriptId = await gasCreate(
            googleClient, `${sentenceCase(name)} Backend`, driveFolder,
        );
        await setPackageDotJson({ name, version: '1.0.0', description: 'A Sheetbase project' }, true);
        await setSheetbaseDotJson({ cloudId: '', driveFolder });
        await setClaspConfigs({ scriptId }, true);
    } catch (error) {
        return logError(error);
    }

    // hook
    try {
        if (options.trusted && options.hook) {
            await setupHook();
        }
    } catch (error) {
        return logError(ERROR.HOOK_ERROR(error));
    }

    // init deploy backend
    try {
        // build backend app if trusted
        if (options.trusted) {
            execSync(
                (options.npm ? '' : 'npm install && ') + 'npm run build',
                { cwd: './backend', stdio: 'ignore' },
            );
        }
        // init deploy the webapp
        const { url } = await gasWebappInit(googleClient, scriptId, null, options.trusted);
        await setConfigs({ backendUrl: url });
    } catch (error) {
        return logError(error);
    }

    console.log('\n ' + LOG.PROJECT_SETUP(`https://script.google.com/d/${scriptId}/edit?usp=drive_web`));
    return process.exit();
}