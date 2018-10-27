const opn = require('opn');

import {
    buildUrls, getSheetbaseDotJson, getFrontendConfigs,
} from '../../services/project/project.service';
import { getClaspConfigs } from '../../services/clasp/clasp.service';
import { LOG, ERROR, logError } from '../../services/message/message.service';

import { urlsHook } from '../../hooks';

import { Options } from './project';

export async function projectUrlsOpenCommand(params: string[], options: Options) {
    let [ name ] = params;
    name = name || 'driveFolder';
    let projectUrls: any;
    try {
        const { driveFolder } = await getSheetbaseDotJson();
        const { backendUrl } = await getFrontendConfigs() as any;
        const { scriptId, projectId } = await getClaspConfigs();
        projectUrls = buildUrls({
            driveFolder, backendUrl, scriptId, projectId,
        });
    } catch (error) {
        return logError(ERROR.URLS_OPEN_FAILS);
    }

    // hook
    try {
        if (options.hook) {
            let customUrls: any;
            try {
                customUrls = await urlsHook();
            } catch (error) {
                return logError(ERROR.HOOK_ERROR(error));
            }
            projectUrls = { ...projectUrls, ...customUrls };
        }
    } catch (error) {
        return logError(ERROR.HOOK_ERROR(error));
    }

    const linkToBeOpened = projectUrls[name];
    console.log(LOG.LINK_OPENED(linkToBeOpened));
    console.log(LOG.URLS_OPEN);
    return opn(linkToBeOpened);
}