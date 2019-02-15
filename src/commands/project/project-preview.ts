const superstatic = require('superstatic');

import { SheetbaseDeployment, getPath, getSheetbaseDotJson } from '../../services/project';
import { logInfo } from '../../services/message';

export async function projectPreviewCommand() {
    const { deployment } = await getSheetbaseDotJson();
    const { sourceDir = './frontend/www' } = deployment || {} as SheetbaseDeployment;
    const sourceCwd = await getPath(sourceDir);
    // launch server
    superstatic.server({
        port: 7777,
        host: 'localhost',
        cwd: sourceCwd,
        config: {
            root: sourceCwd,
        },
        debug: true,
    }).listen(() => logInfo('See your app at: http://localhost:7777'));
}