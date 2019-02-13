import { pathExists, readFile } from 'fs-extra';
import { OAuth2Client } from 'google-auth-library';
import * as readDir from 'fs-readdir-recursive';

import { FileCopyRequestBody } from './drive';

export const DEPLOY_PATH = 'backend/deploy';
export const INIT_CONTENT = [
    {
        name: 'appsscript',
        type: 'JSON',
        source: `
        {
            "webapp": {
              "access": "ANYONE_ANONYMOUS",
              "executeAs": "USER_DEPLOYING"
            },
            "exceptionLogging": "STACKDRIVER"
        }
        `,
    },
    {
        name: 'index',
        type: 'SERVER_JS',
        source: `
        function doGet() {
            return HtmlService.createHtmlOutput('Sheetbase backend, init succeed ...');
        }
        `,
    },
];

export interface CreationRequestBody {
    title: string;
    parentId?: string;
}

export interface File {
    name: string;
    type: string;
    source: string;
}

export async function gasCreate(
    client: OAuth2Client,
    title: string,
    parentId?: string,
): Promise<string>  {
    const requestData: CreationRequestBody = {
        title,
    };
    if(parentId) requestData.parentId = parentId;
    const { data } = await client.request<{scriptId: string}>({
        method: 'POST',
        url: 'https://script.googleapis.com/v1/projects',
        data: requestData,
    });
    return data.scriptId;
}

export async function gasCopy(
    client: OAuth2Client,
    fileId: string,
    name: string,
    parents: string[] = [],
): Promise<string> {
    const driveFolderId: string = parents[0];
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
    // make sure the file in a correct folder
    const fileParents: string[] = ['root', ...data.parents];
    if(!fileParents.includes(driveFolderId)) {
        await client.request({
            method: 'PATCH',
            url: `https://www.googleapis.com/drive/v3/files/${data.id}?` +
                `addParents=${driveFolderId}&removeParents=${fileParents.join()}`,
            data: {
                name,
            },
        });
    }
    return data.id;
}

export async function gasGetLocalContent(path: string): Promise<File[]> {
    const files: File[] = [];
    const types = {
        js: 'SERVER_JS',
        html: 'HTML',
        json: 'JSON',
    };
    if (! await pathExists(path + '/appsscript.json')) {
        return [];
    }
    // read all except files or folders in BUILD_MAIN_CODE_IGNORE
    const localFiles = readDir(path);
    for (let i = 0; i < localFiles.length; i++) {
        const fileName = localFiles[i];
        // name
        const nameSplit = fileName.split('.');
        const name = nameSplit.shift().replace(/\\/g, '/');
        const ext = nameSplit.pop();
        // type
        const type = types[ext];
        // source
        const source: string = await readFile(`${path}/${fileName}`, 'utf-8');
        if (!!name && !!type && !!source) {
            files.push({
                name, type, source,
            });
        }
    }
    return files;
}

export async function gasPush(
    client: OAuth2Client,
    scriptId: string,
    files?: File[],
) {
    if (!files) {
        files = await gasGetLocalContent(DEPLOY_PATH);
    }
    const { data } = await client.request({
        method: 'PUT',
        url: `https://script.googleapis.com/v1/projects/${scriptId}/content`,
        data: { files },
    });
    return data;
}

export async function gasVersions(
    client: OAuth2Client,
    scriptId: string,
) {
    const { data } = await client.request({
        method: 'GET',
        url: `https://script.googleapis.com/v1/projects/${scriptId}/versions`,
    });
    return data;
}

export async function gasVersion(
    client: OAuth2Client,
    scriptId: string,
    description = 'Update',
) {
    const requestData: any = {};
    if (description) requestData.description = description;
    const { data } = await client.request({
        method: 'POST',
        url: `https://script.googleapis.com/v1/projects/${scriptId}/versions`,
        data: requestData,
    });
    return data;
}

export async function gasDeployments(
    client: OAuth2Client,
    scriptId: string,
) {
    const { data } = await client.request({
        method: 'GET',
        url: `https://script.googleapis.com/v1/projects/${scriptId}/deployments`,
    });
    return data;
}

export async function gasDeploy(
    client: OAuth2Client,
    scriptId: string,
    versionNumber = 1,
    description = 'Deploy webapp',
) {
    const requestData: any = {};
    if (versionNumber) requestData.versionNumber = versionNumber || 1;
    if (description) requestData.description = description;
    const { data } = await client.request({
        method: 'POST',
        url: `https://script.googleapis.com/v1/projects/${scriptId}/deployments`,
        data: requestData,
    });
    return data;
}

export async function gasRedeploy(
    client: OAuth2Client,
    scriptId: string,
    deploymentId: string,
    versionNumber: number,
    description = 'Update webapp',
) {
    const requestData: any = {
        deploymentConfig: {
            scriptId,
            versionNumber,
            description: description ? description : `Update webapp V${versionNumber}`,
        },
    };
    const { data } = await client.request({
        method: 'PUT',
        url: `https://script.googleapis.com/v1/projects/${scriptId}/deployments/${deploymentId}`,
        data: requestData,
    });
    return data;
}

export async function gasUndeploy(
    client: OAuth2Client,
    scriptId: string,
    deploymentId: string,
) {
    const { data } = await client.request({
        method: 'DELETE',
        url: `https://script.googleapis.com/v1/projects/${scriptId}/deployments/${deploymentId}`,
    });
    return data;
}

export async function gasWebappInit(
    client: OAuth2Client,
    scriptId: string,
    description = 'Init webapp',
    pushContent = false,
) {
    // update the content
    await gasPush(client, scriptId, pushContent ? null : INIT_CONTENT);
    // create new version
    await gasVersion(client, scriptId, 'Init');
    const result = await gasDeploy(client, scriptId, 1, description) as any;
    return result.entryPoints[0].webApp;
}

export async function gasWebappUpdate(
    client: OAuth2Client,
    scriptId: string,
    deploymentId: string,
    versionNumber?: number,
    description?: string,
) {
    // deploy new version
    if (!versionNumber) {
        await gasPush(client, scriptId);
        // create new version
        versionNumber = (
            await gasVersion(client, scriptId) as any
        ).versionNumber;
    }
    // redeploy or rollback
    return await gasRedeploy(
        client, scriptId, deploymentId, versionNumber,
        description || 'Update webapp V' + versionNumber,
    );
}
