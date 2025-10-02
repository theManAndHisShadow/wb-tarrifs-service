import 'dotenv/config';
import { getValueFromEnv } from "#utils/common.js";
import { saveToSheet } from './core.js';
import { getFreshDataFormWbAPI } from '#services/WbApiDataPuller/index.js';

// N.B: draft code
const SHEET_ID = getValueFromEnv('SHEET_ID');
const API_ENDPOINT = "https://common-api.wildberries.ru/api/v1/tariffs/box";
const DEFAULT_SHEET_NAME = 'stocks_coefs';
const CREDENTIALS_PATH = getValueFromEnv('GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_PATH');

if (!CREDENTIALS_PATH) throw new Error("Set 'GOOGLE_CREDENTIALS_PATH' in .env!");

(async () => {
  const data = await getFreshDataFormWbAPI(API_ENDPOINT);

  const warehouseList = data.response.data.warehouseList || [];

  if (warehouseList.length === 0) {
    console.log('No data returned from API');
    return;
  }

  const headers = Object.keys(warehouseList[0]);
  const sheetData = warehouseList.map((row: Record<string, any>) =>
    headers.map((key) => {
      const val = row[key];
      return val === '-' || val === null || val === undefined ? '' : String(val).replace(',', '.');
    })
  );

  sheetData.unshift(headers);

  await saveToSheet({
    sheetName: DEFAULT_SHEET_NAME,
    spreadsheetId: SHEET_ID,
    data: sheetData,
    credentialsPath: CREDENTIALS_PATH
  });

  console.log('Data successfully saved to sheet!');
})();

