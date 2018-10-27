export interface CreationRequestBody {
    title: string;
    parentId?: string;
}

export interface File {
    name: string;
    type: string;
    source: string;
}