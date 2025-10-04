import 'dotenv/config';
import { getValueFromEnv } from "#utils/common.js";
import { getFreshDataFormWbAPI } from '#services/WbApiDataPuller/index.js';
import { saveToSheet } from '#services/SheetUpdater/index.js';

export default function pullAndPush() {
  const SHEET_IDS = JSON.parse(getValueFromEnv('SHEET_IDS')) as string[] ?? [];
  if(SHEET_IDS.length === 0) throw new Error("Array from 'SHEET_IDS' has zero length! Check your .env file");

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

    SHEET_IDS.map(async (id) => {
      await saveToSheet({
        sheetName: DEFAULT_SHEET_NAME,
        spreadsheetId: id,
        data: sheetData,
        credentialsPath: CREDENTIALS_PATH
      });
    });
  })();
}
