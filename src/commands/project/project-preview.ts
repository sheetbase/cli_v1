const superstatic = require('superstatic');

import { Deployment, getPath, getSheetbaseDotJson } from '../../services/project';
import { logInfo } from '../../services/message';

export async function projectPreviewCommand() {
    const { deployment } = await getSheetbaseDotJson();
    const { wwwDir = './frontend/www' } = deployment || {} as Deployment;
    const wwwCwd = await getPath(wwwDir);
    // launch server
    superstatic.server({
        port: 7777,
        host: 'localhost',
        cwd: wwwCwd,
        config: {
            rewrites: [{ source: '**', destination: '/index.html' }],
            cleanUrls: true,
        },
        debug: true,
    }).listen(() => logInfo('See your app at: http://localhost:7777'));
}