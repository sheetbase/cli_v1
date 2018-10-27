import { readJson, writeJson } from '../project/project.service';

import { CLASP_CONFIG_PATH } from './clasp.config';
import { ClaspConfigs } from './clasp.type';

export async function getClaspConfigs(): Promise<ClaspConfigs> {
    return await readJson(CLASP_CONFIG_PATH);
}

export async function setClaspConfigs(
    data: ClaspConfigs, override?: boolean,
): Promise<ClaspConfigs> {
    return await writeJson(CLASP_CONFIG_PATH, data, override);
}