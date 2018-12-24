import { OAuth2Client } from 'google-auth-library';

export interface ItemSchema {
    name: string;
    note?: string;
    width?: number;
    value?: any;
    type?: 'any' | 'boolean' | 'number' | 'string' | 'object';
}

export async function createSheetBySchema(
    client: OAuth2Client,
    spreadsheetId: string,
    sheetName: string,
    schema: ItemSchema[],
) {
    const sheetId = Math.round(Math.random() * 1E9);
    const columnCount = schema.length;

    // build configs
    const values = [];
    const initValues = [];
    const widths = [];
    for (let i = 0; i < schema.length; i++) {
        const item = schema[i];

        // values
        const value = {
            userEnteredValue: {
                stringValue: item.name,
            },
            userEnteredFormat: {
                backgroundColor: { red: 0.8, green: 0.8, blue: 0.8 },
                textFormat: { bold: true },
                horizontalAlignment: 'CENTER',
            },
        };
        if (item.note) {
            value['note'] = item.note;
        }
        values.push(value);

        // initValues
        let initUserEnteredValue = {};
        if (!!item.value) {
            if (typeof item.value === 'number') {
                initUserEnteredValue = {
                    numberValue: item.value,
                };
            } else if (typeof item.value === 'boolean') {
                initUserEnteredValue = {
                    boolValue: item.value,
                };
            } else if (item.value.substr(0, 1) === '=') {
                initUserEnteredValue = {
                    formulaValue: item.value,
                };
            } else if (item.value instanceof Object) {
                initUserEnteredValue = {
                    stringValue: JSON.stringify(item.value),
                };
            } else {
                initUserEnteredValue = {
                    stringValue: item.value,
                };
            }
        }
        initValues.push(!!initUserEnteredValue ? { userEnteredValue: initUserEnteredValue } : null);

        // columns size
        if (item.width) {
            widths.push({
                updateDimensionProperties: {
                    range: {
                        sheetId,
                        dimension: 'COLUMNS',
                        startIndex: i,
                        endIndex: i + 1,
                    },
                    properties: {
                        pixelSize: item.width,
                    },
                    fields: 'pixelSize',
                },
            });
        }
    }

    // sum up request data
    const requestData = {
        requests: [

            // add the sheet
            {
                addSheet: {
                    properties: {
                        sheetId,
                        title: sheetName,
                        gridProperties: {
                            rowCount: 2,
                            columnCount,
                            frozenRowCount: 1,
                            frozenColumnCount: 2,
                        },
                    },
                },
            },

            // set values
            {
                updateCells: {
                    rows: [ { values }, { values: initValues } ],
                    fields: '*',
                    range: {
                        sheetId,
                        startRowIndex: 0,
                        endRowIndex: 2,
                        startColumnIndex: 0,
                        endColumnIndex: columnCount,
                    },
                },
            },

            // set columns size
            ... widths,
        ],
    };

    // send the request
    await client.request({
        method: 'POST',
        url: `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
        data: requestData,
    });

}

export async function deleteDefaultSheet(
    client: OAuth2Client,
    spreadsheetId: string,
) {
    await deleteSheet(client, spreadsheetId, 0);
}

export async function deleteSheet(
    client: OAuth2Client,
    spreadsheetId: string,
    sheetId: number,
) {
    const requestData = {
        requests: [
            {
                deleteSheet: { sheetId },
            },
        ],
    };

    // send the request
    await client.request({
        method: 'POST',
        url: `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
        data: requestData,
    });
}