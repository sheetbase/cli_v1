import { OAuth2Client } from 'google-auth-library';

export interface ItemSchema {
    name: string;
    description?: string;
    size?: number;
    type?: 'string' | 'number' | 'boolean' | 'object';
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
    const sizes = [];
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
        if (item.description) {
            value['note'] = item.description;
        }
        values.push(value);

        // columns size
        if (item.size) {
            sizes.push({
                updateDimensionProperties: {
                    range: {
                        sheetId,
                        dimension: 'COLUMNS',
                        startIndex: i,
                        endIndex: i + 1,
                    },
                    properties: {
                        pixelSize: item.size,
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

            // set header values
            {
                updateCells: {
                    rows: [ { values } ],
                    fields: '*',
                    range: {
                        sheetId,
                        startRowIndex: 0,
                        endRowIndex: 1,
                        startColumnIndex: 0,
                        endColumnIndex: columnCount,
                    },
                },
            },

            // set columns size
            ... sizes,
        ],
    };

    // send the request
    await client.request({
        method: 'POST',
        url: `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
        data: requestData,
    });

}