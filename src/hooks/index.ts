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

    buildName(name?: string, builder?: {
        (projectName: string): string;
    }) {
        const { projectName } = this.system;
        if (!!builder && builder instanceof Function) {
            name = builder(projectName);
        } else {
            name = name || sentenceCase(projectName) + ' ' + (new Date()).getTime();
        }
        return name;
    }

    async randomStr(length = 32, punctuation = false) {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return randomstring.generate({
            length,
            charset: charset + (punctuation ? '-_!@#$%&*' : ''),
        });
    }

    async createDatabase(name?: string) {
        name = this.buildName(name, (projectName) => `${projectName} Database`);
        return await this.driveCreateSheets(name);
    }

    async driveCreateFolder(name?: string) {
        const { googleClient, driveFolder } = this.system;
        return await driveCreateFolder(
            googleClient,
            this.buildName(name, (projectName) => `${projectName} Folder`),
            [driveFolder],
        );
    }

    async driveCreateFile(mimeType: string, name?: string) {
        if (!mimeType) { throw new Error('Missing args.'); }
        const { googleClient, driveFolder } = this.system;
        return await driveCreateFile(
            googleClient,
            this.buildName(name, (projectName) => `${projectName} File`),
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
            this.buildName(name, (projectName) => `${projectName} Copied File (${fileId})`),
            [driveFolder],
        );
    }

    async driveCreateSheets(name?: string) {
        return await this.driveCreateFile(
            this.buildName(name, (projectName) => `${projectName} Sheets`),
            'application/vnd.google-apps.spreadsheet',
        );
    }

}
