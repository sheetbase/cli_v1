import { exec } from '../../services/command';

export async function unknownCommand(cmd: string) {
  return exec('npm run ' + cmd);
}