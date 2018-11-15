const ttyTable = require('tty-table');

import { getPackageDotJson } from '../../services/project';

export async function projectInfoCommand() {
    const packageJson = await getPackageDotJson();
    const table = ttyTable([
        {value: 'Key', width: 50},
        {value: 'Value', width: 300},
    ], []);
    for (const key of Object.keys(packageJson)) {
        table.push([key, packageJson[key]]);
    }
    console.log('Project information:\n');
    console.log(table.render());
    return process.exit();
}