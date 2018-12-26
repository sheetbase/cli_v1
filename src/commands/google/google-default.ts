import { setDefaultGoogleAccountId } from '../../services/google';
import { logOk } from '../../services/message';
import { googleListCommand } from './google-list';

export async function googleDefaultCommand(params: string[]) {
    const [ id ] = params;
    // if no id provided, print out the default account
    if (!id) {
        return googleListCommand({ default: true });
    }
    // set the default account by id
    await setDefaultGoogleAccountId(id);
    logOk('GOOGLE_DEFAULT__OK', true, [id]);
}