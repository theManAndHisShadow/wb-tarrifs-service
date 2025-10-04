import 'dotenv/config';
import { getValueFromEnv } from "#utils/common.js";
import { pullFreshDataFormWbAPI } from '#services/WbApiDataPuller/index.js';
import { pushToGoogleSheets } from '#services/SheetUpdater/index.js';
import { pullDataFromPostgres, pushDataToPostgres } from '#postgres/knex.js';

export default function pullAndPush() {
  const SHEET_IDS = JSON.parse(getValueFromEnv('SHEET_IDS')) as string[] ?? [];
  if (SHEET_IDS.length === 0) throw new Error("Array from 'SHEET_IDS' has zero length! Check your .env file");

  const API_ENDPOINT = "https://common-api.wildberries.ru/api/v1/tariffs/box";
  const DEFAULT_SHEET_NAME = 'stocks_coefs';
  const CREDENTIALS_PATH = getValueFromEnv('GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_PATH');

  if (!CREDENTIALS_PATH) throw new Error("Set 'GOOGLE_CREDENTIALS_PATH' in .env!");

  (async () => {
    // Весь пайплайн pullAndPush
    // 1 подтянуть данные с api
    const data = await pullFreshDataFormWbAPI(API_ENDPOINT);

    const warehouseList = data.response.data.warehouseList || [];

    if (warehouseList.length === 0) {
      console.log('No data returned from API');
      return;
    }

    // 2 закинуть данные с апи в постгрес
    // в данном случае постгрес будет являеться истоником истины для хранения данных
    // таким образом можно подключить ещё плюсом фронт/другой сервис который будет брать данные из дб
    await pushDataToPostgres(warehouseList);

    // 3 достать актуальные данные из постгреса
    // даже если таблицы гугла умрут или их кто-то потрёт, данные всегда берутся из надёжного источника
    const freshData = await pullDataFromPostgres();

    const headers = Object.keys(freshData[0]);
    const sheetData = freshData.map((row: Record<string, any>) =>
      headers.map((key) => {
        const val = row[key];
        return val === '-' || val === null || val === undefined ? '' : String(val).replace(',', '.');
      })
    );

    sheetData.unshift(headers);

    // 4 обновить все таблицы чьи айдишки указаны в массиве
    // на самом деле тут не совсем понятно что считать источником истины - есть таблица в постгрес с айдишниками таблиц
    // но сейчас она просто синхронится с реальным источником истины - застрингифайленным массивом айдишников в .env
    await Promise.all(
      SHEET_IDS.map(id =>
        pushToGoogleSheets({
          sheetName: DEFAULT_SHEET_NAME,
          spreadsheetId: id,
          data: sheetData,
          credentialsPath: CREDENTIALS_PATH
        })
      )
    );

  })();
}
