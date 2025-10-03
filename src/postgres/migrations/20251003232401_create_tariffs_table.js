/**
 * @param {import("knex").Knex} knex
 */
export async function up(knex) {
  await knex.schema.createTable("tariffs", (table) => {
    table.increments("id").primary();

    table.decimal("box_delivery_base", 10, 2).nullable();
    table.decimal("box_delivery_coef_expr", 10, 2).nullable();
    table.decimal("box_delivery_liter", 10, 2).nullable();

    table.decimal("box_delivery_marketplace_base", 10, 2).nullable();
    table.decimal("box_delivery_marketplace_coef_expr", 10, 2).nullable();
    table.decimal("box_delivery_marketplace_liter", 10, 2).nullable();

    table.decimal("box_storage_base", 10, 4).nullable();
    table.decimal("box_storage_coef_expr", 10, 2).nullable();
    table.decimal("box_storage_liter", 10, 4).nullable();

    table.string("geo_name").notNullable();
    table.string("warehouse_name").notNullable();

    table.date("date").notNullable().defaultTo(knex.fn.now());

    table.unique(["geo_name", "warehouse_name", "date"]);
  });
}

/**
 * @param {import("knex").Knex} knex
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists("tariffs");
}
