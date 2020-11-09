'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class ProductColorSchema extends Schema {
  up() {
    this.create('product_colors', table => {
      table.increments();
      table.integer('product_id').unsigned().index('product_sizes_product_id');
      table
        .foreign('product_id')
        .references('id')
        .on('products')
        .onDelete('CASCADE');
      table.string('name');
      table.decimal('value', 10, 2);
      table.timestamps();
    });
  }

  down() {
    this.drop('product_colors');
  }
}

module.exports = ProductColorSchema;
