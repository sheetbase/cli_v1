const opn = require('opn');

import { logInfo } from '../../services/message';

import { buildUrls } from './project-urls-list';

export async function projectUrlsOpenCommand(params: string[]) {
    const [ name = 'driveFolder' ] = params; // open driveFolder url by default
    const urls = await buildUrls();
    const linkToBeOpened = urls[name];

    logInfo('APP_INFO_LINK_OPENED', false, [ linkToBeOpened ]);
    return opn(linkToBeOpened);
}