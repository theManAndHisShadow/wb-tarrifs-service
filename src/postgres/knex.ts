import _knex from "knex";
import knexConfig from "../config/knex/knexfile.js"
import { convertToHumanDate } from "#utils/common.js";

const knex = _knex(knexConfig);
const today = convertToHumanDate({
  timestamp: Date.now(),
  delimiter: '-',
  reversed: true,
});

export default knex;

function logMigrationResults(action: string, result: [number, string[]]) {
  if (result[1].length === 0) {
    console.log(["latest", "up"].includes(action) ? "All migrations are up to date" : "All migrations have been rolled back");
    return;
  }
  console.log(`Batch ${result[0]} ${["latest", "up"].includes(action) ? "ran" : "rolled back"} the following migrations:`);
  for (const migration of result[1]) {
    console.log("- " + migration);
  }
}
function logMigrationList(list: [{ name: string }[], { file: string }[]]) {
  console.log(`Found ${list[0].length} Completed Migration file/files.`);
  for (const migration of list[0]) {
    console.log("- " + migration.name);
  }
  console.log(`Found ${list[1].length} Pending Migration file/files.`);
  for (const migration of list[1]) {
    console.log("- " + migration.file);
  }
}

function logSeedRun(result: [string[]]) {
  if (result[0].length === 0) {
    console.log("No seeds to run");
  }
  console.log(`Ran ${result[0].length} seed files`);
  for (const seed of result[0]) {
    console.log("- " + seed?.split(/\/|\\/).pop());
  }
  // Ran 5 seed files
}

function logSeedMake(name: string) {
  console.log(`Created seed: ${name.split(/\/|\\/).pop()}`);
}

export const migrate = {
  latest: async () => {
    logMigrationResults("latest", await knex.migrate.latest());
  },
  rollback: async () => {
    logMigrationResults("rollback", await knex.migrate.rollback());
  },
  down: async (name?: string) => {
    logMigrationResults("down", await knex.migrate.down({ name }));
  },
  up: async (name?: string) => {
    logMigrationResults("up", await knex.migrate.up({ name }));
  },
  list: async () => {
    logMigrationList(await knex.migrate.list());
  },
  make: async (name: string) => {
    if (!name) {
      console.error("Please provide a migration name");
      process.exit(1);
    }
    console.log(await knex.migrate.make(name, { extension: "js" }));
  },
};

export const seed = {
  run: async () => {
    logSeedRun(await knex.seed.run());
  },
  make: async (name: string) => {
    if (!name) {
      console.error("Please provide a seed name");
      process.exit(1);
    }
    logSeedMake(await knex.seed.make(name));
  },
};


export const pushDataToPostgres = async (warehouseList: any) => {
  // подготовка данных для вставки
  const __parseNumber = (value: string | number | null | undefined) => {
    if (value === null || value === undefined || value === '-') return null;
    if (typeof value === 'number') return value;
    return parseFloat(value.replace(',', '.'));
  }

  for (const item of warehouseList) {
    await knex('tariffs')
      .insert({
        box_delivery_base: __parseNumber(item.boxDeliveryBase),
        box_delivery_coef_expr: __parseNumber(item.boxDeliveryCoefExpr),
        box_delivery_liter: __parseNumber(item.boxDeliveryLiter),
        box_delivery_marketplace_base: __parseNumber(item.boxDeliveryMarketplaceBase),
        box_delivery_marketplace_coef_expr: __parseNumber(item.boxDeliveryMarketplaceCoefExpr),
        box_delivery_marketplace_liter: __parseNumber(item.boxDeliveryMarketplaceLiter),
        box_storage_base: __parseNumber(item.boxStorageBase),
        box_storage_coef_expr: __parseNumber(item.boxStorageCoefExpr),
        box_storage_liter: __parseNumber(item.boxStorageLiter),
        geo_name: item.geoName,
        warehouse_name: item.warehouseName,
        date: today
      })
      .onConflict(['geo_name', 'warehouse_name', 'date'])
      .merge();
  }
};

export const pullDataFromPostgres = async () => {
  const rows = await knex('tariffs')
    .orderBy('box_delivery_coef_expr', 'asc');

  return rows;
};