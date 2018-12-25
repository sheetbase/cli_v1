const opn = require('opn');

import { logInfo, logOk } from '../../services/message';

import { buildUrls } from './project-urls';
import { Options } from './project';

export async function projectUrlCommand(name = 'drive', options: Options) {
    const urls = await buildUrls();
    const link = urls[name];

    if (options.open) {
        logInfo('APP__INFO__LINK_OPENED', false, [ link ]);
        return opn(link);
    } else {
        logOk('PROJECT_URL__OK', true, [link]);
    }
}