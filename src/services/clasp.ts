import { readJson, writeJson } from './project';

export const CLASP_CONFIG_PATH = 'backend/.clasp.json';

export interface ClaspConfigs {
    scriptId: string;
    projectId?: string;
}

export async function getClaspConfigs(customRoot?: string): Promise<ClaspConfigs> {
    return await readJson(CLASP_CONFIG_PATH, customRoot);
}

export async function setClaspConfigs(
    data: ClaspConfigs,
    modifier?: boolean | { (currentData: {}, data: {}): {} },
    customRoot?: string,
) {
    await writeJson(CLASP_CONFIG_PATH, data, modifier, customRoot);
}