import { OAuth2Client } from 'google-auth-library';

import { FileCreationRequestBody, FileCopyRequestBody } from './drive.type';

/**
 * Create Drive file/folder
 * @param name - File/folder name
 * @param mimeType - File type
 * @param parents - Parent folders
 */
export async function driveCreate(
    client: OAuth2Client, name: string, mimeType: string, parents: string[] = [],
): Promise<string> {
    const requestData: FileCreationRequestBody = {
        name, mimeType,
    };
    if(parents) requestData.parents = parents;
    const { data } = await client.request<{id: string}>({
        method: 'POST',
        url: 'https://www.googleapis.com/drive/v3/files',
        data: requestData,
    });
    return data.id;
}

/**
 * Create Drive file
 * @param name - File name
 * @param mimeType - File type
 * @param parents - Parent folders
 */
export async function driveCreateFile(
    client: OAuth2Client, name: string, mimeType: string, parents: string[] = [],
): Promise<string> {
    return driveCreate(client, name, mimeType, parents);
}

/**
 * Create Drive folder
 * @param name - Folder name
 * @param parents - Parent folders
 */
export async function driveCreateFolder(
    client: OAuth2Client, name: string, parents: string[] = [],
): Promise<string> {
    return driveCreate(client, name, 'application/vnd.google-apps.folder', parents);
}

/**
 * Copy Drive file
 * @param fileId - Source file ID
 * @param name - File name
 * @param parents - Parent folders
 */
export async function copyFile(
    client: OAuth2Client, fileId: string, name: string, parents: string[] = [],
): Promise<string> {
    const requestData: FileCopyRequestBody = {
        name,
    };
    if(parents) requestData.parents = parents;
    // copy the file
    const { data } = await client.request<{id: string, parents: string[]}>({
        method: 'POST',
        url: `https://www.googleapis.com/drive/v3/files/${fileId}/copy?fields=id,parents`,
        data: requestData,
    });
    return data.id;
}

export async function driveTrash(
    client: OAuth2Client, fileId: string,
): Promise<any> {
    const { data } = await client.request({
        method: 'PATCH',
        url: `https://www.googleapis.com/drive/v3/files/${fileId}`,
        data: {
            trashed: true,
        },
    });
    return data;
}

export async function driveRemove(
    client: OAuth2Client, fileId: string,
): Promise<any> {
    const { data } = await client.request({
        method: 'DELETE',
        url: `https://www.googleapis.com/drive/v3/files/${fileId}`,
    });
    return data;
}