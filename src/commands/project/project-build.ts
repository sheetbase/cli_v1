import { exec } from '../../services/command';

export async function projectBuildCommand() {
    // build backend
    await exec('sheetbase backend build');
    // build frontend
    await exec('sheetbase frontend build');
    // pre-render content
    // seo
}