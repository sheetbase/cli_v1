import { exec } from '../../services/command';
import { logInfo, logOk } from '../../services/message';

import { Options } from './project';

export async function projectBuildCommand(options?: Options) {
    // backend
    if (!options.frontend) {
        // build backend
        logInfo('Build the backend.');
        await exec('sheetbase backend build');
    }

    // frontend
    if (!options.backend) {
        // build frontend
        logInfo('Build the frontend.');
        await exec('sheetbase frontend build');

        // pre-render content
        logInfo('Prerender the content.');
        await exec('sheetbase frontend prerender');

        // seo
        logInfo('Generate SEO content.');
        await exec('sheetbase frontend seo');
    }

    // done
    logOk('PROJECT_BUILD__OK', true);
}