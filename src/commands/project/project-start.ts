import { resolve } from 'path';
import { pathExists, remove } from 'fs-extra';
import axios from 'axios';

import { buildValidFileName } from '../../services/utils';
import { download, unzip, unwrap } from '../../services/file';
import { setInitialConfigs, getBackendConfigs } from '../../services/project';
import { exec } from '../../services/command';
import { logError, logOk, logAction } from '../../services/message';

import { Options } from './project';

export async function projectStartCommand(params: string[], options?: Options) {
    // project name and path
    let [name, url ] = params;
    name = buildValidFileName(name || `sheetbase-project-${(new Date()).getTime()}`);
    const deployPath = resolve(name);

    // check if a project exists
    if (await pathExists(name)) {
        return logError('PROJECT__ERROR__EXISTS');
    }

    // prepare the resource url
    url = await resolveResource(url);
    if (!url || (!url.endsWith('.git') && !url.endsWith('.zip'))) {
        return logError('PROJECT_START__ERROR__INVALID_RESOURCE');
    }

    // project files
    await logAction('Get the resource from ' + url, async () => {
        if (url.endsWith('.git')) {
            // clone the repo when has .git url
            exec(`git clone ${url} ${name}`, '.', 'ignore', true);
            await remove(deployPath + '/' + '.git'); // delete .git folder
        } else {
            const downloadedPath = await download(url, deployPath, 'resource.zip');
            await unzip(downloadedPath, deployPath);
            await remove(downloadedPath);
            await unwrap(deployPath); // if wrapped in a folder
        }
    });

    // finalize for theme
    if (await pathExists(deployPath + '/sheetbase.json')) {

        // reset configs
        await logAction('Initial config the project', async () => {
            await setInitialConfigs(deployPath);
        });

        // run setup
        if (options.setup) {
            exec('sheetbase setup', deployPath);
        }

        // create models
        const { databaseId } = await getBackendConfigs(deployPath);
        if (!!databaseId) {
            exec('sheetbase model -c', deployPath);
        }

        // install packages
        if (options.install) {
            await logAction('Install backend dependencies', async () => {
                exec('npm install', deployPath + '/backend');
            });
            await logAction('Install frontend dependencies', async () => {
                exec('npm install', deployPath + '/frontend');
            });
        }

        logOk('PROJECT_START__OK__THEME', true, [name, options]);

    } else {
        // install packages
        if (options.install) {
            await logAction('Install dependencies', async () => {
                exec('npm install', deployPath);
            });
        }
        logOk('PROJECT_START__OK__NOT_THEME', true, [name, options]);
    }

}

async function resolveResource(resource?: string) {
    /**
     * n/a > blank-angular@latest
     * name > name@latest
     * name@ver > name@ver
     * <name>/<repo>@ver
     * full zip url > full zip url
     */
    resource = (resource || 'sheetbase-themes/blank-angular').replace('@latest', '');
    if (!resource.endsWith('.git') && !resource.endsWith('.zip')) {
        // add repo org
        if (resource.indexOf('/') < 0) {
            resource = 'sheetbase-themes/' + resource;
        }
        // add version
        if (resource.indexOf('@') < 0) {
            const { data } = await axios({
                method: 'GET',
                url: `https://api.github.com/repos/${resource}/releases/latest`,
            });
            resource = resource + '@' + data.name;
        }
        // final resource = <org>/<repo>@<version>
        const [ name, version ] = resource.split('@');
        resource = `https://github.com/${name}/archive/${version}.zip`;
    }
    return resource;
}
