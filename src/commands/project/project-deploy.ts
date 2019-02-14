import { exec } from '../../services/command';

export async function projectDeployCommand() {
    // deploy backend
    await exec('sheetbase backend deploy');
    // deploy frontend
    await exec('sheetbase frontend deploy');
}