const opn = require('opn');

import { LOG } from '../../services/message';

export async function docsCommand() {
    const docsUrl = 'https://sheetbase.net/docs';
    console.log(LOG.LINK_OPENED(docsUrl));
    return opn(docsUrl);
}