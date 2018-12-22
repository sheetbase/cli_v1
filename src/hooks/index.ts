const randomstring = require('randomstring');
import { OAuth2Client } from 'google-auth-library';

import { driveCreateFolder, driveCreateFile, copyFile } from '../services/drive';

interface System {
    googleClient: OAuth2Client;
    driveFolder: string;
}

export class BuiltinHooks {

    private system: System;

    constructor(system: System) {
        this.system = system;
    }

    async randomStr(length = 32, punctuation = false) {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return randomstring.generate({
            length,
            charset: charset + (punctuation ? '-_!@#$%&*' : ''),
        });
    }

    async driveCreateFolder(name: string) {
        if (!name) { throw new Error('Missing args.'); }
        const { googleClient, driveFolder } = this.system;
        return await driveCreateFolder(googleClient, name, [driveFolder]);
    }

    async driveCreateFile(name: string, mimeType: string) {
        if (!name || !mimeType) { throw new Error('Missing args.'); }
        const { googleClient, driveFolder } = this.system;
        return await driveCreateFile(googleClient, name, mimeType, [driveFolder]);
    }

    async driveCreateSheets(name: string) {
        return await this.driveCreateFile(name, 'application/vnd.google-apps.spreadsheet');
    }

    async driveCopyFile(fileId: string, name: string) {
        if (!fileId || !name) { throw new Error('Missing args.'); }
        const { googleClient, driveFolder } = this.system;
        return await copyFile(googleClient, fileId, name, [driveFolder]);
    }

}
