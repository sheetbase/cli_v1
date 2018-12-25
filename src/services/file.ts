import { promisify } from 'util';
import { readdir, createWriteStream } from 'fs';
import { ensureDir, copy, remove, lstatSync } from 'fs-extra';
import axios from 'axios';
import * as zipper from 'adm-zip';

export const readdirAsync = promisify(readdir);

export function download(url: string, destination: string, fileName: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const downloadedFilePath: string = destination + '/' + fileName;
        ensureDir(destination).catch(reject)
        .then(() => {
            axios({
                method: 'GET', url,
                responseType: 'stream',
            }).then(downloadResponse => {
                // pipe the result stream into a file on disc
                downloadResponse.data.pipe(createWriteStream(downloadedFilePath));
                downloadResponse.data.on('end', () => resolve(downloadedFilePath));
                downloadResponse.data.on('error', reject);
            }, reject);
        }, reject);
    });
}

export function unzip(src: string, dest: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        try {
            setTimeout(() => { // waiting for .zip file ready policy
                const zip = new zipper(src);
                zip.extractAllTo(dest, true);
                resolve(true);
            }, 1000);
        } catch (error) {
            reject(error);
        }
    });
}

export function unwrap(dir: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        readdirAsync(dir)
        .then((localPathChildren: string[]) => {
            const firstItem: string = dir + '/' + localPathChildren[0];
            if (
                localPathChildren.length === 1 &&
                lstatSync(firstItem).isDirectory()
            ) {
                copy(firstItem, dir).catch(reject)
                .then(() => { // unwrap it
                    return remove(firstItem);
                }).then(() => { // remove wrapped dir
                    resolve(true);
                }, reject);
            }
        }, reject);
    });
}