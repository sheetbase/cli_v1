import { LOG } from '../../services/message';

export async function accountUpgradeCommand() {
    console.log(LOG.ACCOUNT_UPGRADE);
    return process.exit();
}