const path = require('path');
import { promisify } from 'util';
import { readdir, createWriteStream, readFile } from 'fs';
import { ensureDir, copy, remove } from 'fs-extra';
import axios from 'axios';
import * as zipper from 'adm-zip';

const readdirAsync = promisify(readdir);
const readFileAsync = promisify(readFile);

export function getCurrentDirectoryBase(): string {
    return path.basename(process.cwd());
}

export function isValidFileName(name: string): boolean {
    return (
        name.indexOf('<') < 0 &&
        name.indexOf('>') < 0 &&
        name.indexOf(':') < 0 &&
        name.indexOf('"') < 0 &&
        name.indexOf('/') < 0 &&
        name.indexOf('\\') < 0 &&
        name.indexOf('|') < 0 &&
        name.indexOf('?') < 0 &&
        name.indexOf('*') < 0
    );
}

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

        ensureDir(destination)
        .catch(reject)
        .then(() => {
            axios({
                method: 'GET', url,
                responseType: 'stream',
            }).then(downloadResponse => {
                // pipe the result stream into a file on disc
                downloadResponse.data.pipe(createWriteStream(downloadedFilePath));

                downloadResponse.data.on('end', () => {
                    resolve(downloadedFilePath);
                });
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

export function deflate(dir: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        readdirAsync(dir)
        .then((localPathChildren: string[]) => {
            const inflatedPath: string = dir + '/' + localPathChildren[0];
            copy(inflatedPath, dir)
            .catch(reject)
            .then(() => { // deflate it
                return remove(inflatedPath);
            }).then(() => { // remove inflated dir
                resolve(true);
            }, reject);
        }, reject);
    });
}

export function validateEmail(email: string): boolean {
    // tslint:disable-next-line:max-line-length
    return (/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i).test(email);
}
export function validatePassword(password: string): boolean {
    return (password.length >= 7);
}
export function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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

export function escapeRegEx(str: string): string {
    return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

export function getMatchIndices(regex: RegExp, str: string): number[] {
    const result: number[] = [];
    let match;
    regex = new RegExp(regex);
    // tslint:disable-next-line:no-conditional-assignment
    while (match = regex.exec(str)) {
       result.push(match.index);
    }
    return result;
}

export async function readJsonFromAnyFile(path: string): Promise<any> {
    const fileContent: string = await readFileAsync(path, 'utf8');
    const openIndexes: number[] = getMatchIndices(/{/g, fileContent);
    const closeIndexes: number[] = getMatchIndices(/}/g, fileContent);
    const openIndex: number = openIndexes[openIndexes.length - 1] + 1;
    const [ closeIndex ] = closeIndexes;
    return JSON.parse(`{${fileContent.substr(openIndex, closeIndex - openIndex)}}`);
}

export function o2a(
    object: {[$key: string]: any}, clone = false, limit = 0, honorable = false,
): any[] {
    let output = [];
    if (clone) {
      object = Object.assign({}, object || {});
    }
    for (const key of Object.keys(object)) {
      if (typeof object[key] === 'object') {
        object[key]['$key'] = key;
      } else {
        object[key] = {
          $key: key,
          value: object[key],
        };
      }
      output.push(object[key]);
    }
    if (limit) {
      output.splice(limit, output.length);
    }
    if (honorable && output.length < 1) {
      output = null;
    }
    return output;
}

export function timeDelta(timeThen: number): number {
    if (!timeThen || isNaN(timeThen)) timeThen = 0;
    const timeNow = (new Date()).getTime();
    const timeDelta: number = timeNow - +timeThen;
    return timeDelta;
}

export function timeDeltaByHour(timeThen: number): number {
    if (!timeThen || isNaN(timeThen)) timeThen = 0;
    const timeNow = (new Date()).getTime();
    const timeDelta: number = timeNow - timeThen;
    return Math.floor(timeDelta / (1000 * 60 * 60));
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

export function formatDateAndTime(date: Date, seperator: string = null): string {
    seperator = seperator || '/';
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hour = date.getHours();
    const minute = date.getMinutes();
    return `${year}${seperator}${month}${seperator}${day} ${hour}:${minute}`;
}

export function tryRearrangeArgs(
    command: string,
    params: string[],
    options: any,
): { command?: string, params?: string[] } {
    if (command && params && options.parent && options.parent.rawArgs) {
        // try fixing wrong command and params
        const { rawArgs } = options.parent;
        const argsBetween3rdAndLast: string[] = rawArgs.splice(4, rawArgs.length - 4);
        let hasFlags = false;
        let hasParams = false;
        argsBetween3rdAndLast.forEach(arg => {
            if (arg.substr(0, 1) === '-') { hasFlags = true; }
            if (arg.substr(0, 1) !== '-') { hasParams = true; }
        });
        if (
            rawArgs[3] &&
            rawArgs[3].substr(0, 1) !== '-' &&
            (rawArgs[rawArgs.length - 1].substr(0, 1) !== '-' &&
            (hasFlags && hasParams))
        ) {
            const wrongCommand: string = command;
            command = params.shift();
            params.unshift(wrongCommand);
        }
    }
    return { command, params };
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

export function ucfirst(s: string): string {
    return s.charAt(0).toUpperCase() + s.substr(1);
}