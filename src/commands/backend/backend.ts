import { execSync } from 'child_process';

export async function backendCommand(cmd: string) {
    execSync('npm run ' + cmd, { cwd: './backend', stdio: 'inherit' });
}