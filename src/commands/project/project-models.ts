const ttyTable = require('tty-table');
import { pathExists, readJson } from 'fs-extra';

import { logOk, green } from '../../services/message';
import { ItemSchema } from '../../services/spreadsheet';
import { readdirAsync } from '../../services/utils';

export async function projectModelsCommand() {
    const models = await getAvailableModels();

    for (const key of Object.keys(models)) {
        console.log('\n + ' + green(key));
        // preview
        const model = models[key];
        const cols = [];
        const descs = [];
        for (let i = 0; i < model.length; i++) {
            const item = model[i];
            cols.push({ value: item.name });
            descs.push(item.type || 'string');
        }
        const table = ttyTable(cols, [descs]);
        console.log(table.render());
    }

    // done
    logOk('PROJECT_MODELS__OK', true);
}

export async function getAvailableModels() {
    const modelsPath = 'models';
    // load models
    let models = {};
    if (await pathExists(modelsPath)) {
        const filePaths = (await readdirAsync(modelsPath)).map(x => modelsPath + '/' + x);
        models = await getModels(filePaths);
    }
    return models;
}

export async function getModels(filePaths: string[]): Promise<{ [name: string]: ItemSchema[] }> {
    const models = {};
    for (let i = 0; i < filePaths.length; i++) {
        const filePath = filePaths[i];
        if (filePath.endsWith('.json')) {
            const modelFile = filePath.split('/').pop();
            const modelName = modelFile.replace('.json', '');
            models[modelName] = await readJson(filePath);
        }
    }
    return models;
}