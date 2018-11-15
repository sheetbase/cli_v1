import { execSync } from 'child_process';

import { logError } from '../../services/message/message.service';

export async function backendCommand(command: string) {
    switch (command) {
        default:
            await run(command);
        break;
    }
}

async function run(cmd: string) {
    try {
        execSync('npm run ' + cmd, { cwd: './backend', stdio: 'inherit' });
    } catch (error) {
        return logError(error);
    }
}