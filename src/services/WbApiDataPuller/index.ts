import 'dotenv/config';
import { convertToHumanDate, getValueFromEnv } from "#utils/common.js";

// N.B: draft code
export async function getFreshDataFormWbAPI(endpoint: string) {
  const API_KEY = getValueFromEnv('DONT_LET_THE_KEY_LEAK_OR_YOU_WILL_FIRED');

  const today = convertToHumanDate({
    timestamp: Date.now(),
    reversed: true,
    delimiter: '-'
  });

  const response = await fetch(`${endpoint}?date=${today}`, {
    headers: {
      "Authorization": API_KEY,
    }
  });

  return await response.json();
}