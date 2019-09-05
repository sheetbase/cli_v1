const ttyTable = require('tty-table');

import { getPackageDotJson } from '../../services/project';

export async function projectInfoCommand() {
  const packageJson = await getPackageDotJson();
  const table = ttyTable([
    { value: 'Key', width: 50, align: 'left' },
    { value: 'Value', width: 200, align: 'left' },
  ], []);
  for (const key of Object.keys(packageJson)) {
    table.push([key, packageJson[key]]);
  }
  console.log(table.render());
  return process.exit();
}