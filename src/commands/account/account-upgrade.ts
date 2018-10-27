import { LOG } from '../../services/message/message.service';

export async function accountUpgradeCommand() {
    console.log(LOG.ACCOUNT_UPGRADE);
    return process.exit();
}