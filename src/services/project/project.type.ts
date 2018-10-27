export interface SheetbaseDotJson {
    cloudId?: string;
    driveFolder?: string;
    configMaps?: {
        frontend?: string[];
        backend?: string[];
    };
    configs?: {
        frontend?: {};
        backend?: {};
    };
}

export interface PackageDotJson {
    name: string;
    version?: string;
    description?: string;
    author?: string;
    homepage?: string;
    license?: string;
    repository?: {
        type: string;
        url: string;
    };
    bugs?: {
        url: string;
    };
}