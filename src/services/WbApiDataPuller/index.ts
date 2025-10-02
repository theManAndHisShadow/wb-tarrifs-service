import 'dotenv/config';
import { convertToHumanDate, getValueFromEnv } from "#utils/common.js";

// N.B: draft code
const API_KEY = getValueFromEnv('DONT_LET_THE_KEY_LEAK_OR_YOU_WILL_FIRED');
const API_ENDPOINT = "https://common-api.wildberries.ru/api/v1/tariffs/box";

const today = convertToHumanDate({
  timestamp: Date.now(),
  reversed: true,
  delimiter: '-'
});

const response = await fetch(`${API_ENDPOINT}?date=${today}`, {
  headers: {
    "Authorization": API_KEY, 
  }
});

const data = await response.json();
console.dir(data, { depth: null, colors: true });