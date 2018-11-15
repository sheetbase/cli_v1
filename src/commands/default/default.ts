import { execSync } from 'child_process';

import { logError } from '../../services/message/message.service';

export async function defaultCommand(cmd: string) {
    try {
        execSync('npm run ' + cmd, { stdio: 'inherit' });
    } catch (error) {
        return logError(error);
    }
}