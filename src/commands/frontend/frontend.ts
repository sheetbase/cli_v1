import { run } from '../../services/command';
import { readJson } from '../../services/project';

export async function frontendCommand(command: string, commander: any) {
    const commanderRawArgs = commander['parent']['rawArgs'];
    const cwd = 'frontend';

    switch (command) {
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
