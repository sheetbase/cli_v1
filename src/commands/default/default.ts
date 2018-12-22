import { execSync } from 'child_process';

export async function defaultCommand(cmd: string) {
    execSync('npm run ' + cmd, { stdio: 'inherit' });
}