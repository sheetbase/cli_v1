import { run } from '../../services/command';
import { readJson } from '../../services/project';

import { frontendBuildCommand } from './frontend-build';
import { frontendDeployCommand } from './frontend-deploy';
import { frontendPrerenderCommand } from './frontend-prerender';
import { frontendSEOCommand } from './frontend-seo';

export async function frontendCommand(command: string, commander: any) {
    const commanderRawArgs = commander['parent']['rawArgs'];
    const cwd = 'frontend';

    switch (command) {
        case 'build':
            await frontendBuildCommand();
        break;

        case 'deploy':
            await frontendDeployCommand();
        break;

        case 'prerender':
            await frontendPrerenderCommand();
        break;

        case 'seo':
            await frontendSEOCommand();
        break;

        case 'install':
        case 'i':
            await run('npm install', command, commanderRawArgs, cwd);
        break;

        case 'uninstall':
        case 'un':
            await run('npm uninstall', command, commanderRawArgs, cwd);
        break;

        case 'run':
            await run('npm run', command, commanderRawArgs, cwd, true);
        break;

        default:
            let cmd = command;
            // run script if available
            const { scripts = {} } = await readJson('package.json', cwd);
            if (!!scripts[command]) {
                cmd = 'npm run ' + command;
            }
            await run(cmd, command, commanderRawArgs, cwd);
        break;
    }
}
