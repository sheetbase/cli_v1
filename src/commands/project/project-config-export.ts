import { writeJson, ensureFile } from 'fs-extra';

import { buildValidFileName } from '../../services/utils';
import { getSheetbaseDotJson } from '../../services/project';
import { logOk } from '../../services/message';

export async function projectConfigExportCommand(params: string[]) {
    // get the path
    let [ jsonFilePath ] = params;
    jsonFilePath = buildValidFileName(
        // tslint:disable-next-line:max-line-length
        (jsonFilePath ||  `sheetbase-configs-exported-${(new Date()).toISOString()}.json`).replace('.json', ''),
    );
    jsonFilePath = (!params[0] ? 'exported/' : '') + jsonFilePath + '.json';

    // export data
    const { configs } = await getSheetbaseDotJson();
    await ensureFile(jsonFilePath);
    await writeJson(jsonFilePath, configs, { spaces: 3 });

    // done
    logOk('PROJECT_CONFIG_EXPORT__OK', true, [ jsonFilePath ]);
}