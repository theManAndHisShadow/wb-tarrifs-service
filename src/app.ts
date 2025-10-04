import cron from 'node-cron';
import { migrate, seed } from "#postgres/knex.js";
import pullAndPush from '#tasks/pullAndPush.js';

await migrate.latest();
await seed.run();

console.log("All migrations and seeds have been run");

cron.schedule(`0 * * * *`, async () => {
  console.log(`[${new Date().toISOString()}] Syncing to Google Sheets`);
  await pullAndPush();
});