"use strict";

const Product = use("App/Models/Product");
const Category = use("App/Models/ProductCategory");
const Size = use("App/Models/ProductSize");
const Color = use("App/Models/ProductColor");
const Inventory = use("App/Models/ProductInventory");
const Helpers = use("App/Helpers");
const Excel = require("exceljs");

/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
/* eslint-disable no-plusplus */
class ProductImport {
  static async importRows(filelocation) {
    let workbook = new Excel.Workbook();

    workbook = await workbook.xlsx.readFile(filelocation);

    const worksheet = workbook.worksheets[0];
    const categories = [];
    const products = [];

    worksheet.eachRow(async (row, rowNumber) => {
      if (rowNumber > 1) {
        categories.push(row.getCell(4).value);
        products.push(row);
      }
    });

    await this.manageCategories(categories);
    await this.manageProducts(products);

    return {
      data: {
        message: "Sua planilha de produtos foi importada com sucesso",
      },
    };
  }

  static async manageCategories(categories) {
    (async () => {
      for (let i = 0; i < categories.length; i++) {
        if (categories[i] !== null) {
          const find = await this.findCategory(categories[i]);

          if (find === null) await this.createCategory(categories[i]);
        }
      }
    })();
  }

  static async manageProducts(products) {
    (async () => {
      for (let i = 0; i < products.length; i++) {
        const code = products[i].getCell(1).value;
        const model = products[i].getCell(2).value;
        const description = products[i].getCell(3).value;
        const priceFormated =
          products[i].getCell(5).value !== null
            ? parseFloat(products[i].getCell(5).value)
            : null;
        const inventory = products[i].getCell(6).value;
        const size = products[i].getCell(7).value;
        const color = products[i].getCell(8).value;
        const categoryId = await this.getCategoryId(
          products[i].getCell(4).value
        );

        let check = await Product.findBy("code", code);

        const productData = {
          model,
          description,
          price: priceFormated,
          category_id: categoryId,
          status: "published",
        };

        // Update or create a new product
        if (check !== null)
          await Product.query().where("id", check.id).update(productData);
        else {
          productData.code = code;
          check = await Product.create(productData);
        }

        if (size !== null) {
          // Update variation management type
          check.merge({
            inventory_type: "variation",
          });
          await check.save();

          const checkSizeVariation = await Size.query()
            .where("name", size)
            .where("product_id", check.id)
            .first();

          // Insert a new size variation
          if (checkSizeVariation === null) {
            const sizeResource = await Size.create({
              product_id: check.id,
              name: size,
              price: priceFormated,
            });

            // Insert new size variation inventory
            await Inventory.create({
              product_id: check.id,
              size_id: sizeResource.id,
              inventory,
            });
          } else {
            // Update size variation value
            checkSizeVariation.merge({
              price: priceFormated,
            });
            await checkSizeVariation.save();

            // Update size variation inventory
            const checkVariationSizeInventory = await Inventory.query()
              .where("product_id", check.id)
              .andWhere("size_id", checkSizeVariation.id)
              .first();

            if (checkVariationSizeInventory === null) {
              await Inventory.create({
                product_id: check.id,
                size_id: checkSizeVariation.id,
                inventory,
              });
            } else {
              checkVariationSizeInventory.merge({
                inventory,
              });
              await checkVariationSizeInventory.save();
            }
          }

          if (color !== null) {
            const checkColor = await Color.query()
              .where("name", size)
              .where("product_id", check.id)
              .first();

            if (checkColor === null) {
              const colorResource = await Color.create({
                product_id: check.id,
                size_id: sizeId,
                price: priceFormated,
                name: color,
              });

              // Insert new size variation inventory
              await Inventory.create({
                product_id: check.id,
                size_id: sizeId,
                inventory,
              });
            } else {
            }
          }
        } else {
          // Update variation management type
          check.merge({
            inventory_type: "single",
          });
          await check.save();

          const checkVariationSizeInventory = await Inventory.query()
            .where("product_id", check.id)
            .andWhere("size_id", null)
            .first();

          if (checkVariationSizeInventory === null) {
            await Inventory.create({
              product_id: check.id,
              inventory,
            });
          } else {
            checkVariationSizeInventory.merge({
              inventory,
            });
            await checkVariationSizeInventory.save();
          }
        }
      }
    })();
  }

  /**
   * Try to find an specific category
   * @param {string} name
   */
  static async findCategory(name) {
    const categoryFriendly = await Helpers.friendlyUrl(name);
    const category = await Category.findBy("friendly_url", categoryFriendly);

    return category;
  }

  /**
   * Insert a new category
   * @param {string} category
   */
  static async createCategory(category) {
    await Category.create({
      title: category,
      status: "published",
    });
  }

  /**
   * Find and return a category id if the name is provided
   * and is a valid name in the database!
   * @param {string} name The category name
   * @returns {number|null} The category id or null
   */
  static async getCategoryId(name) {
    const categoryFriendly = await Helpers.friendlyUrl(name);
    const category = await Category.findBy("friendly_url", categoryFriendly);

    if (category !== null && category !== undefined) return category.id;

    return null;
  }
}

module.exports = ProductImport;
