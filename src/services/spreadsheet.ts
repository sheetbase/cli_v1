import { OAuth2Client } from 'google-auth-library';

import { Model } from './model';

export async function getSheets(
    client: OAuth2Client,
    spreadsheetId: string,
) {
    const { data  } = await client.request({
        method: 'GET',
        url: `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
        params: {
            ranges: [],
            includeGridData: false,
        },
    });
    const { sheets } = data;
    // get name and gid
    const result = {};
    for (let i = 0; i < sheets.length; i++) {
        const { sheetId, title: name } = sheets[i].properties;
        result[name] = sheetId;
    }
    return result;
}

export async function createSheetByModel(
    client: OAuth2Client,
    spreadsheetId: string,
    sheetName: string,
    model: Model,
) {
    const { gid: sheetId, schema } = model;
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

export async function getData(
    client: OAuth2Client,
    spreadsheetId: string,
    sheetName: string,
) {
    const { data } = await client.request({
        method: 'GET',
        url: `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1:ZZ`,
    });
    const { values } = data;
    return translateRangeValues(values);
}

// turn [[],[], ...] to [{},{}, ...]
export function translateRangeValues<Item>(
    values: any[][],
    noHeader = false,
    modifier = (item: Item) => item,
) {
    values = values || [];
    // get header
    const headers: string[] = !noHeader ? values.shift() : [];
    // build data
    const result: Item[] = [];
    for (let i = 0; i < values.length; i++) {
        const item = {} as Item;
        // process columns
        const rows = values[i] || [];
        for (let j = 0; j < rows.length; j++) {
            if (rows[j]) {
                item[headers[j] || ('value' + (j + 1))] = rows[j];
            }
        }
        if (Object.keys(item).length > 0) {
            item['_row'] = !noHeader ? i + 2 : i + 1;
            result.push(modifier(item));
        }
    }
    return result;
}
