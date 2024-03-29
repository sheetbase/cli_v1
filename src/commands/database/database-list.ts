const ttyTable = require('tty-table');

import { isValid } from '../../services/project';
import { loadProjectModels } from '../../services/model';
import { logError, green, blue } from '../../services/message';

export async function databaseListCommand() {
  if (! await isValid()) {
    return logError('PROJECT__ERROR__INVALID');
  } else {
    const models = await loadProjectModels();
    for (const key of Object.keys(models)) {
      const { gid, schema, public: isPublic } = models[key];
      console.log('\n + ' +
        green(key) +
        ` [${blue('' + (gid || 'auto'))}]` +
        (isPublic ? ' (public)' : ''),
      );
      // preview
      const cols = [];
      const widths = [];
      for (let i = 0; i < schema.length; i++) {
        const item = schema[i];
        cols.push({ value: item.name });
        widths.push(item.width || 100);
      }
      const table = ttyTable(cols, [widths]);
      console.log(table.render());
    }
  }
}
