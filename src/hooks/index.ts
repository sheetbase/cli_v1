const randomstring = require('randomstring');
import { sentenceCase } from 'change-case';
import { OAuth2Client } from 'google-auth-library';

import { driveCreateFolder, driveCreateFile, copyFile } from '../services/drive';

interface System {
    googleClient: OAuth2Client;
    driveFolder: string;
    projectName: string;
}

export class BuiltinHooks {

    private system: System;

    constructor(system: System) {
        this.system = system;
    }

    projectPrettyName() {
        return sentenceCase(this.system.projectName);
    }

    async randomStr(length = 32, punctuation = false) {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return randomstring.generate({
            length,
            charset: charset + (punctuation ? '-_!@#$%&*' : ''),
        });
    }

    async createDatabase(name?: string) {
        return await this.driveCreateSheets(name || `${this.projectPrettyName()} Database`);
    }

    async driveCreateFolder(name?: string) {
        const { googleClient, driveFolder } = this.system;
        return await driveCreateFolder(
            googleClient,
            name || `${this.projectPrettyName()} Folder`,
            [driveFolder],
        );
    }

    async driveCreateFile(mimeType: string, name?: string) {
        if (!mimeType) { throw new Error('Missing args.'); }
        const { googleClient, driveFolder } = this.system;
        return await driveCreateFile(
            googleClient,
            name || `${this.projectPrettyName()} File`,
            mimeType,
            [driveFolder],
        );
    }

    async driveCopyFile(fileId: string, name?: string) {
        if (!fileId) { throw new Error('Missing args.'); }
        const { googleClient, driveFolder } = this.system;
        return await copyFile(
            googleClient,
            fileId,
            name || `${this.projectPrettyName()} Copied (${fileId})`,
            [driveFolder],
        );
    }

    async driveCreateSheets(name?: string) {
        return await this.driveCreateFile(
            'application/vnd.google-apps.spreadsheet',
            name || `${this.projectPrettyName()} Sheets`,
        );
    }

}
