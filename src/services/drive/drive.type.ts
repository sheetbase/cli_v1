export interface FileCreationRequestBody {
    name: string;
    mimeType: string;
    parents?: string[];
}

export interface FileCopyRequestBody {
    name: string;
    parents?: string[];
}
