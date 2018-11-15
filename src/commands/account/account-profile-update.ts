import { updateProfile } from '../../services/user';
import { buildKeyValueFromParams } from '../../services/utils';
import { LOG, ERROR, logError } from '../../services/message';

export async function accountProfileUpdateCommand(params: string[]) {
    if ((params || []).length <= 0) {
        return logError(ERROR.PROFILE_NO_VALUE);
    }
    try {
        await updateProfile(buildKeyValueFromParams(params));
    } catch (error) {
        return logError(ERROR.PROFILE_UPDATE_FAILS);
    }
    console.log(LOG.PROFILE_UPDATE);
    return process.exit();
}