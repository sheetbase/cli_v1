import { execSync } from 'child_process';

export async function frontendCommand(cmd: string) {
    execSync('npm run ' + cmd, { cwd: './frontend', stdio: 'inherit' });
}
