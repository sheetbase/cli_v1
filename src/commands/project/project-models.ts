const ttyTable = require('tty-table');

import { loadModels } from '../../services/model';
import { logOk, green, blue } from '../../services/message';

export async function projectModelsCommand() {
    const models = await loadModels();

    for (const key of Object.keys(models)) {
        const { gid, schema, public: isPublic } = models[key];
        console.log('\n + ' +
            green(key) +
            ` [${ blue('' + (gid || 'auto')) }]` +
            (isPublic ? ' (public)' : ''),
        );
        // preview
        const cols = [];
        const types = [];
        for (let i = 0; i < schema.length; i++) {
            const item = schema[i];
            cols.push({ value: item.name });
            if (!item.type && !!item.value) {
                if (typeof item.value === 'number') {
                    item.type = 'number';
                } else if (typeof item.value === 'boolean') {
                    item.type = 'boolean';
                } else if (item.value.substr(0, 1) === '=') {
                    item.type = 'any';
                } else if (item.value instanceof Object) {
                    item.type = 'object';
                } else {
                    item.type = 'string';
                }
            }
            types.push(item.type || 'string');
        }
        const table = ttyTable(cols, [types]);
        console.log(table.render());
    }

    // done
    logOk('PROJECT_MODELS__OK', true, [models]);
}
