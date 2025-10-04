import 'dotenv/config';
import { getValueFromEnv } from "#utils/common.js";

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function seed(knex) {
  let sheetIds;

  try {
    sheetIds = JSON.parse(getValueFromEnv("SHEET_IDS") ?? "[]");
  } catch (e) {
    console.error("❌ Failed to parse SHEET_IDS_JSON from .env", e);
    return;
  }

  if (!Array.isArray(sheetIds) || sheetIds.length === 0) {
    console.warn("⚠️ SHEET_IDS_JSON is empty or not an array — skipping spreadsheet seed");
    return;
  }

  console.log(`🧹 Clearing "spreadsheets" table...`);
  await knex("spreadsheets").del();

  const records = sheetIds.map((id) => ({ spreadsheet_id: id }));

  console.log(`📝 Inserting ${records.length} spreadsheet ID(s)...`);
  await knex("spreadsheets").insert(records);

  console.log(`✅ Spreadsheet seed applied successfully.`);
}

