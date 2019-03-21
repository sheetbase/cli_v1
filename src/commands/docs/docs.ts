const opn = require('opn');

import { logInfo } from '../../services/message';

export async function docsCommand() {
    const docsUrl = 'https://sheetbase.dev/docs';
    logInfo('APP__INFO__LINK_OPENED', false, [docsUrl]);
    return opn(docsUrl);
}