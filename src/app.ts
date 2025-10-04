import cron from 'node-cron';
import knex, { migrate, seed } from "#postgres/knex.js";
import pullAndPush from '#tasks/pullAndPush.js';
import { getValueFromEnv } from '#utils/common.js';

await migrate.latest();
await seed.run();

console.log("All migrations and seeds have been run");

// в тестовом режиме интервал - каждую минуту
const interval = getValueFromEnv('CRON_INTERVAL');

cron.schedule(`*/${interval} * * * *`, async () => {
  console.log(`[${new Date().toISOString()}] Syncing to Google Sheets`);
  await pullAndPush();
});