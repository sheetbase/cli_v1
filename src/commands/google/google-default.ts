import { setDefaultGoogleAccountId } from '../../services/google/google.service';
import { LOG, ERROR, logError } from '../../services/message/message.service';

import { googleListCommand } from './google-list';

export async function googleDefaultCommand(params: string[]) {
    const [ id ] = params;
    if (!id) {
        return googleListCommand({default: true});
    } else {
        try {
            await setDefaultGoogleAccountId(id);
        } catch (error) {
            return logError(ERROR.GOOGLE_DEFAULT_FAILS);
        }
        console.log(LOG.GOOGLE_DEFAULT(id));
    }
    return process.exit();
}