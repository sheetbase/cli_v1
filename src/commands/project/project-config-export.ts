import { resolve } from 'path';
import { writeJson, ensureFile } from 'fs-extra';

import { buildValidFileName } from '../../services/utils';
import { getSheetbaseDotJson } from '../../services/project';
import { logOk } from '../../services/message';

export async function projectConfigExportCommand() {
    // get the path
    const fileName = buildValidFileName(
        'configs-exported-' + new Date().toISOString().split('T').shift(),
    ) + '.json';
    const savingPath = resolve('__exported__', fileName);

    // export data
    const { configs } = await getSheetbaseDotJson();
    await ensureFile(savingPath);
    await writeJson(savingPath, configs, { spaces: 3 });

    // done
    logOk('PROJECT_CONFIG_EXPORT__OK', true, [ savingPath ]);
}