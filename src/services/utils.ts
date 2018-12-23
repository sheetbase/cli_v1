import * as os from 'os';
import { promisify } from 'util';
import { readdir, createWriteStream } from 'fs';
import { ensureDir, copy, remove, lstatSync } from 'fs-extra';
import axios from 'axios';
import * as zipper from 'adm-zip';

const readdirAsync = promisify(readdir);

export function buildValidFileName(name) {
return name.replace(/\ /g, '-')
    .replace(/\</g, '-')
    .replace(/\,/g, '-')
    .replace(/\>/g, '-')
    .replace(/\./g, '-')
    .replace(/\?/g, '-')
    .replace(/\//g, '-')
    .replace(/\:/g, '-')
    .replace(/\;/g, '-')
    .replace(/\"/g, '-')
    .replace(/\'/g, '-')
    .replace(/\{/g, '-')
    .replace(/\[/g, '-')
    .replace(/\}/g, '-')
    .replace(/\]/g, '-')
    .replace(/\|/g, '-')
    .replace(/\\/g, '-')
    .replace(/\`/g, '-')
    .replace(/\~/g, '-')
    .replace(/\!/g, '-')
    .replace(/\@/g, '-')
    .replace(/\#/g, '-')
    .replace(/\$/g, '-')
    .replace(/\%/g, '-')
    .replace(/\^/g, '-')
    .replace(/\&/g, '-')
    .replace(/\*/g, '-')
    .replace(/\(/g, '-')
    .replace(/\)/g, '-')
    .replace(/\+/g, '-')
    .replace(/\=/g, '-');
}

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

export function buildKeyValueFromParams(params: any[]): {[key: string]: any} {
    const output: any = {};
    params.forEach(item => {
        const multipleSplit = item.split('|');
        multipleSplit.forEach(single => {
            const singleSplit = single.trim().split('=');
            if(singleSplit[1]) {
                output[singleSplit[0].trim()] = makeupValues(singleSplit[1].trim());
            }
        });
    });
    return output;
}

export function formatDate(date: Date): string {
    const monthNames = [
      'January', 'February', 'March',
      'April', 'May', 'June', 'July',
      'August', 'September', 'October',
      'November', 'December',
    ];
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
    return monthNames[monthIndex] + ' ' + day + ', ' + year;
}

export function makeupValues(value: any) {
    if ((value + '').toLowerCase() === 'true') {
        // boolean TRUE
        value = true;
    }
    else if ((value + '').toLowerCase() === 'false') {
        // boolean FALSE
        value = false;
    }
    else if (!isNaN(value)) {
        // number
        if (Number(value) % 1 === 0) {
            // tslint:disable-next-line:ban
            value = parseInt(value, 2);
        }
        if (Number(value) % 1 !== 0) {
            // tslint:disable-next-line:ban
            value = parseFloat(value);
        }
    }
    else {
        // JSON
        try {
            value = JSON.parse(value);
        } catch (e) {
            // continue
        }
    }
    return value;
}

export function cmd(cmd: string) {
    return (os.type() === 'Windows_NT') ? cmd + '.cmd' : cmd;
}