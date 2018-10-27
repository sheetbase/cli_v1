import { updateProfile } from '../../services/user/user.service';
import { buildKeyValueFromParams } from '../../services/utils/utils.service';
import { LOG, ERROR, logError } from '../../services/message/message.service';

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