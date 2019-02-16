const superstatic = require('superstatic');

import { SheetbaseDeployment, getPath, getSheetbaseDotJson } from '../../services/project';
import { logInfo } from '../../services/message';

export async function projectPreviewCommand() {
    const { deployment } = await getSheetbaseDotJson();
    const { wwwDir = './frontend/www' } = deployment || {} as SheetbaseDeployment;
    const wwwCwd = await getPath(wwwDir);
    // launch server
    superstatic.server({
        port: 7777,
        host: 'localhost',
        cwd: wwwCwd,
        config: {
            root: wwwCwd,
        },
        debug: true,
    }).listen(() => logInfo('See your app at: http://localhost:7777'));
}