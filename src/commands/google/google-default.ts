import { setDefaultGoogleAccountId } from '../../services/google';

import { googleListCommand } from './google-list';

export async function googleDefaultCommand(params: string[]) {
    const [ id ] = params;

    // if no id provided, print out the default account
    if (!id) {
        return googleListCommand({ default: true });
    }

    // set the default account by id
    await setDefaultGoogleAccountId(id);
}