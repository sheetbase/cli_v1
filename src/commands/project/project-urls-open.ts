const opn = require('opn');

import { logInfo } from '../../services/message';

import { buildUrls } from './project-urls-list';

export async function projectUrlsOpenCommand(params: string[]) {
    // open driveFolder url by default
    const [ name = 'driveFolder' ] = params;

    // build urls
    const urls = buildUrls();

    const linkToBeOpened = urls[name];
    logInfo('APP_INFO_LINK_OPENED', false, [ linkToBeOpened ]);
    return opn(linkToBeOpened);
}