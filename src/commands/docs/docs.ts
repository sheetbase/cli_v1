const open = require('open');

import { logInfo } from '../../services/message';

export async function docsCommand() {
    const docsUrl = 'https://sheetbase.dev/docs';
    logInfo('APP__INFO__LINK_OPENED', false, [docsUrl]);
    return open(docsUrl);
}