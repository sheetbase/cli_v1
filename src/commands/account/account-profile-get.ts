import chalk from 'chalk';

import { getUserProfile, getUserSubscription } from '../../services/user/user.service';
import { Profile, Subscription } from '../../services/user/user.type';
import { ERROR, logError } from '../../services/message/message.service';

import { Options } from './account';

export async function accountProfileGetCommand(options: Options = {}) {
    let profile: Profile;
    let subscription: Subscription;
    try {
        profile = await getUserProfile(options.cache);
        subscription = await getUserSubscription(options.cache);
    } catch (error) {
        console.log(error);
        return logError(ERROR.PROFILE_GET_FAILS);
    }
    console.log('\n My profile:');
    console.log('   + Display name: ' + chalk.yellow(profile.displayName || 'n/a'));
    console.log('   + Email: ' + chalk.yellow(profile.email || 'n/a'));
    console.log('   + PIN: ' + chalk.yellow(profile.pin ? `${profile.pin}` : 'n/a'));
    console.log('   + Plan: ' + chalk.yellow(subscription.plan || 'free'));
    console.log('\n View full profile at ' +
                chalk.blue('https://cloud.sheetbase.net/account/profile') +
                ', $ ' +
                chalk.green('sheetbase profile open'));
    return process.exit();
}