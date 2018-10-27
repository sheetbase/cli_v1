import chalk from 'chalk';
const ttyTable = require('tty-table');

import { getBackendConfigs, getFrontendConfigs } from '../../services/project/project.service';
import { LOG } from '../../services/message/message.service';

export async function projectConfigListCommand() {
    const backendConfigs = await getBackendConfigs();
    const frontendConfigs = await getFrontendConfigs();
    if (backendConfigs) {
        const table = ttyTable([
            {value: 'Key', width: 100, align: 'left'},
            {value: 'Value', width: 500, align: 'left'},
        ], []);
        for(const key of Object.keys(backendConfigs)) {
            table.push([key, chalk.green(backendConfigs[key] || 'n/a')]);
        }
        console.log('Backend configs:\n');
        console.log(table.render());
    }
    if (frontendConfigs) {
        const table = ttyTable([
            {value: 'Key', width: 100, align: 'left'},
            {value: 'Value', width: 500, align: 'left'},
        ], []);
        for(const key of Object.keys(frontendConfigs)) {
            table.push([key, chalk.green(frontendConfigs[key] || 'n/a')]);
        }
        console.log('Frontend configs:\n');
        console.log(table.render());
    }
    console.log(LOG.CONFIG_LIST);
    return process.exit();
}