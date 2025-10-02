import { google } from 'googleapis';

interface SaveToSheetOptions {
  spreadsheetId: string;
  sheetName: string;
  data: any[][];
  credentialsPath: string;
}

/**
 * Saves a 2D array of data to a Google Sheet.
 * 
 * - Inserts data starting at cell `A1` of the specified sheet tab.
 * - Automatically creates the sheet tab if it does not exist.
 * - Replaces any existing data in the target range.
 * - Allows specifying custom path to service account JSON credentials.
 * 
 * @param {SaveToSheetOptions} options - Configuration options.
 * @param {string} options.spreadsheetId - The ID of the Google Spreadsheet (from the URL).
 * @param {string} options.sheetName - The name of the sheet/tab to write to. If it doesn't exist, it will be created.
 * @param {any[][]} options.data - 2D array of values to write. Each inner array represents a row.
 * @param {string} [options.credentialsPath='./credentials.json'] - Path to the service account credentials JSON file.
 * 
 * @throws {Error} If authentication fails or the spreadsheet ID is invalid.
 * 
 * @example
 * await saveToSheet({
 *   spreadsheetId: '1aBcD1234EfGhIjKlMnoPqRsTuVwXyZ0123456789',
 *   sheetName: 'stocks_coefs',
 *   data: [
 *     ['boxDeliveryBase', 'geoName'],
 *     ['46', 'NYC'],
 *     ['-', 'LA']
 *   ],
 *   credentialsPath: './credentials.json'
 * });
 */
export async function saveToSheet({
  spreadsheetId,
  sheetName,
  data,
  credentialsPath = './credentials.json'
}: SaveToSheetOptions) {
  const auth = new google.auth.GoogleAuth({
    keyFile: credentialsPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  const sheets = google.sheets({ version: 'v4', auth });

  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = meta.data.sheets?.find(s => s.properties?.title === sheetName);

  if (!sheet) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          { addSheet: { properties: { title: sheetName } } }
        ]
      }
    });
    console.log(`Created new sheet: "${sheetName}"`);
  }

  const range = `${sheetName}!A1`;
  const res = await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    requestBody: { values: data }
  });

  console.log(`Updated ${res.data.updatedCells} cells in sheet "${sheetName}"`);
}
