import 'dotenv/config';
import { convertToHumanDate, getValueFromEnv } from "#utils/common.js";

// N.B: draft code
export async function pullFreshDataFormWbAPI(endpoint: string) {
  const API_KEY = getValueFromEnv('API_KEY');

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