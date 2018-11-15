const opn = require('opn');

import { getUserCustomToken } from '../../services/user';
import { LOG } from '../../services/message';

export async function accountProfileOpenCommand() {
    let link = 'https://cloud.sheetbase.net/account/profile';
    const customToken: string = await getUserCustomToken();
    if (customToken) {
        link = `https://cloud.sheetbase.net/login?token=${customToken}&redirect=/account/profile`;
    }
    console.log(LOG.LINK_OPENED(link));
    return opn(link);
}