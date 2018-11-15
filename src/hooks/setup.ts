import { getHook, CLIHook } from './index';

import { getOAuth2Client } from '../services/google';
import { driveCreateFolder, driveCreateFile } from '../services/drive';

export async function setupHook(data?: {}) {
    const hook: CLIHook = await getHook('setup');
    let hookResult: {};
    if (hook) {
        hookResult = await hook(
            data,
            {
                drive: driveVendor(data),
            },
        );
    }
    return hookResult || {};
}

async function driveVendor(data) {
    const { driveFolder } = data;
    const googleClient = await getOAuth2Client();
    const createFolder = async (name: string) => {
        await driveCreateFolder(googleClient, name, [driveFolder]);
    };
    const createFile = async (name: string, mimeType: string) => {
        await driveCreateFile(googleClient, name, mimeType, [driveFolder]);
    };
    return {
        createFolder,
        createFile,
    };
}