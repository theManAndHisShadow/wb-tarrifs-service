import cron from 'node-cron';
import { migrate, seed } from "#postgres/knex.js";
import pullAndPush from '#tasks/pullAndPush.js';

await migrate.latest();
await seed.run();

console.log("All migrations and seeds have been run");

// sync at startup
(async () => {
  console.log(`[TASK][${new Date().toISOString()}]: Initial sync to Google Sheets at startup`);
  try {
    await pullAndPush();
    console.log(`[TASK][${new Date().toISOString()}]: ✅ Initial sync completed`);
  } catch (err) {
    console.error(`[TASK][${new Date().toISOString()}]: ❌ Initial sync failed`, err);
  }
})();

cron.schedule(`0 * * * *`, async () => {
  console.log(`[TASK][${new Date().toISOString()}]: Syncing to Google Sheets`);
  await pullAndPush();
});