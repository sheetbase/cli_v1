import { exec } from '../../services/command';
import { logInfo, logOk } from '../../services/message';

export async function projectBuildCommand() {
    // build backend
    logInfo('Build the backend.');
    await exec('sheetbase backend build');

    // build frontend
    logInfo('Build the frontend.');
    await exec('sheetbase frontend build');

    // pre-render content
    logInfo('Prerender the content.');
    await exec('sheetbase frontend prerender');

    // seo
    logInfo('Generate SEO content.');
    await exec('sheetbase frontend seo');

    // done
    logOk('PROJECT_BUILD__OK', true);
}