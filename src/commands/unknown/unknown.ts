import { exec } from '../../services/command';

export async function unknownCommand(cmd: string) {
    await exec('npm run ' + cmd);
}