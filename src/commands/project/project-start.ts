import * as os from 'os';
import { resolve } from 'path';
import { execSync } from 'child_process';
import { pathExists, remove } from 'fs-extra';
import axios from 'axios';

import { buildValidFileName, download, unzip, deflate } from '../../services/utils';
import { LOG, ERROR, logError, logWait } from '../../services/message';

import { hasHooks } from '../../hooks';

import { Options } from './project';

export async function projectStartCommand(params: string[], options?: Options) {
    const name = buildValidFileName(
        params[0] || `sheetbase-project-${(new Date()).getTime()}`,
    );
    const deployPath: string = resolve(name);

    // check if exists
    if (await pathExists(name)) {
        return logError(ERROR.PROJECT_EXISTS);
    }

    // parse theme string
    const downloadUrl: string = await parseThemeString(params[1]);
    if (!downloadUrl) {
        return logError(ERROR.START_INVALID_THEME);
    }

    // start
    try {
        logWait(LOG.START_BEGIN);
        // download the file
        const downloadedPath = await download(downloadUrl, deployPath, 'theme.zip');
        // upzip the archive
        await unzip(downloadedPath, deployPath);
        await remove(downloadedPath); // delete .zip file
        // move file outside
        if (!await pathExists(deployPath + '/sheetbase.json')) { // guest it is inside
            await deflate(deployPath);
        }
        console.log('\n ' + LOG.START_SUCCEED(name));
    } catch (error) {
        return logError(ERROR.START_FAILED);
    }

    // install packages
    try {
        if (options.npm) {
            logWait(LOG.NPM_INSTALL_BEGIN);
            await installDependencies(deployPath);
            console.log('\n ' + LOG.NPM_INSTALL_SUCCEED);
        }
    } catch (error) {
        console.error('\n ' + ERROR.NPM_INSTALL_FAILED);
    }

    // Run setup
    if (options.setup) {
        // defautl trust to original theme
        if (downloadUrl.includes('github.com/sheetbase-themes/')) {
            options.trusted = true;
        }
        await runSetup(deployPath, options);
    } else {
        console.log('\n ' + LOG.PROJECT_START(name));
    }

    return process.exit();
}

async function installDependencies(path: string): Promise<void> {
    const NPM = (os.type() === 'Windows_NT') ? 'npm.cmd' : 'npm';
    console.log(`\n     Backend dependencies:`);
    execSync(`${NPM} install`, {cwd: path + './backend', stdio: 'inherit'});
    console.log(`\n     Frontend dependencies:`);
    execSync(`${NPM} install`, {cwd: path + './frontend', stdio: 'inherit'});
    if (await hasHooks(path)) {
        console.log(`\n     Hook dependencies:`);
        execSync(`${NPM} install`, {cwd: path + './hooks', stdio: 'inherit'});
    }
}

async function runSetup(path: string, options: Options): Promise<void> {
    const SHEETBASE = (os.type() === 'Windows_NT') ? 'sheetbase.cmd' : 'sheetbase';
    let command =  `${SHEETBASE} setup`;
    if (!options.hook) command += ' --no-hook';
    if (options.trusted) command += ' --trusted';
    execSync(command, {cwd: path, stdio: 'inherit'});
}

async function parseThemeString(theme = 'blank-angular@latest'): Promise<string> {
    /**
     * Official:
     * n/a > theme-blank-angular@latest
     * name > theme-name@latest
     * name@ver > theme-name@ver
     *
     * Custom:
     * full zip url > full zip url
     * TODO: Github <name>/<repo>@ver
     */
    let downloadUrl: string;
    if (!theme.endsWith('.zip')) {
        const themeSplit = theme.split('@');
        const [ name ] = themeSplit;
        const version = themeSplit[1];
        if (!version || version === 'latest') {
            try {
                const { data } = await axios({
                    method: 'GET',
                    url: `https://api.github.com/repos/sheetbase-themes/${name}/releases/latest`,
                });
                downloadUrl = data.zipball_url;
            } catch (error) {
                /** */
            }
        } else {
            downloadUrl = `https://github.com/sheetbase-themes/${name}/archive/${version}.zip`;
        }
    }
    return downloadUrl;
}