import { writeJson, ensureFile } from 'fs-extra';

import { buildValidFileName } from '../../services/utils/utils.service';
import { getSheetbaseDotJson } from '../../services/project/project.service';
import { LOG, ERROR, logError } from '../../services/message/message.service';

export async function projectConfigExportCommand(params: string[]) {
    let [ jsonFilePath ] = params;
    jsonFilePath = buildValidFileName(
        (jsonFilePath ||  `configs-exported-${(new Date()).toISOString()}.json`).replace('.json', ''),
    );
    jsonFilePath = (!params[0] ? 'exported/' : '') + jsonFilePath + '.json';
    try {
        await ensureFile(jsonFilePath);
        const { configs } = await getSheetbaseDotJson();
        await writeJson(jsonFilePath, configs, { spaces: '\t' });
    } catch (error) {
        return logError(ERROR.CONFIG_EXPORT_FAILS);
    }
    console.log(LOG.CONFIG_EXPORT(jsonFilePath));
    return process.exit();
}