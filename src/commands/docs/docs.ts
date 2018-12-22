const opn = require('opn');

import { logInfo } from '../../services/message';

export async function docsCommand() {
    const docsUrl = 'https://sheetbase.net/docs';
    logInfo('DOCS', false, [docsUrl]);
    return opn(docsUrl);
}