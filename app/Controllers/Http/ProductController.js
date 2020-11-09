"use strict";

const Resource = use("App/Models/Product");
const ResourceGallery = use("App/Models/ProductGallery");
const ResourceSize = use("App/Models/ProductSize");
const ResourceInventory = use("App/Models/ProductInventory");
const Helpers = use("App/Helpers");

/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
/* eslint-disable no-plusplus */
class ProductController {
  async index({ request, response }) {
    const req = request.all();
    const offset = req.offset ? parseInt(req.offset, 10) : 1;
    const limit = req.limit ? parseInt(req.limit, 10) : 10;
    const search = req.search ? req.search : null;
    const paginate = req.paginate ? req.paginate : true;

    let resources = Resource.query().orderBy("created_at", "desc");

    if (search !== null) {
      const searchVal = `%${decodeURIComponent(search)}%`;
      resources = resources
        .where("model", "like", searchVal)
        .orWhere("reference", "like", searchVal)
        .orWhere("headline", "like", searchVal)
        .orWhere("code", "like", searchVal);
    }

    if (paginate === "false")
      resources = await resources
        .with("category")
        .with("imageCover")
        .with("sizes.inventory")
        .with("inventory")
        .fetch();
    else
      resources = await resources
        .with("category")
        .with("imageCover")
        .with("inventory")
        .with("sizes.inventory")
        .paginate(offset, limit);

    return response.json({
      data: {
        resources,
      },
    });
  }

  async store({ request }) {
    const {
      code,
      model,
      status,
      price,
      categoryId,
      friendlyUrl,
      description,
      headline,
      width,
      height,
      length,
      weight,
      promotionalPrice,
      promotionalStart,
      promotionalEnd,
      inventoryType,
    } = request.all();

    const data = {
      model,
      status,
      price,
      description,
      headline,
      width,
      height,
      length,
      weight,
      code,
      inventory_type: inventoryType,
      category_id: categoryId,
      friendly_url: friendlyUrl,
      promotional_price: promotionalPrice,
      promotional_start: promotionalStart,
      promotional_end: promotionalEnd,
    };

    const resource = await Resource.create(data);
    const { images, variations, imageCover, stock } = request.all();

    await this.manageGallery(images, resource.id);

    if (variations !== undefined)
      await this.manageSizes(variations, resource.id);

    if (stock !== undefined) await this.manageSelfInventory(stock, resource.id);

    if (imageCover) {
      await ResourceGallery.query().where("product_id", resource.id).update({
        is_cover: 0,
      });

      await ResourceGallery.query()
        .where("media_id", imageCover)
        .where("product_id", resource.id)
        .update({
          is_cover: 1,
        });
    }

    return {
      data: {
        message: `O produto ${resource.model} foi inserido com sucesso!`,
        resource,
      },
    };
  }

  async show({ params, response }) {
    const resource = await Resource.query()
      .with("images")
      .with("imageCover")
      .with("sizes.inventory")
      .with("inventory")
      .where("id", params.id)
      .first();

    if (!resource) {
      return response.status(404).json({
        data: {
          message: "O produto solicitado não foi encontrado!",
        },
      });
    }

    return {
      data: {
        resource,
      },
    };
  }

  async update({ params, request, response }) {
    const resource = await Resource.find(params.id);
    const {
      code,
      model,
      status,
      price,
      categoryId,
      friendlyUrl,
      description,
      headline,
      width,
      height,
      length,
      weight,
      inventoryType,
      promotionalPrice,
      promotionalStart,
      promotionalEnd,
    } = request.all();

    const { images, variations, imageCover, stock } = request.all();

    const data = {
      model,
      status,
      price,
      description,
      headline,
      width,
      height,
      length,
      weight,
      code,
      inventory_type: inventoryType,
      category_id: categoryId,
      friendly_url: friendlyUrl,
      promotional_price: promotionalPrice,
      promotional_start: promotionalStart,
      promotional_end: promotionalEnd,
    };

    if (!resource) {
      return response.status(404).json({
        data: {
          message: "O produto solicitado não foi encontrado!",
        },
      });
    }

    resource.merge(data);
    await resource.save(data);

    if (stock !== undefined) await this.manageSelfInventory(stock, resource.id);

    if (images !== undefined) await this.manageGallery(images, resource.id);

    if (variations !== undefined)
      await this.manageSizes(variations, resource.id);

    if (imageCover) {
      await ResourceGallery.query().where("product_id", resource.id).update({
        is_cover: 0,
      });

      await ResourceGallery.query()
        .where("media_id", imageCover)
        .where("product_id", resource.id)
        .update({
          is_cover: 1,
        });
    }

    return {
      data: {
        resource,
        message: `O produto ${resource.model} foi atualizado com sucesso.`,
      },
    };
  }

  async destroy({ params, response }) {
    const resource = await Resource.find(params.id);

    if (!resource) {
      return response.status(404).json({
        data: {
          message: "O produto solicitado não foi encontrado!",
        },
      });
    }

    try {
      await resource.images().delete();
      await resource.delete();

      return {
        data: {
          message: "O produto foi deletado permanentemente!",
        },
      };
    } catch (e) {
      return response.status(400).json({
        data: {
          message: "Não foi possível remover o produto no momento!",
        },
      });
    }
  }

  async manageGallery(images, productId) {
    const existImages = await ResourceGallery.query()
      .where("product_id", productId)
      .fetch();

    if (existImages.rows.length > 0) {
      await ResourceGallery.query().where("product_id", productId).delete();
    }

    Array.from(images).forEach(async (el) => {
      await ResourceGallery.create({
        product_id: productId,
        media_id: el,
      });
    });
  }

  async manageSelfInventory(stock, productId) {
    if (stock !== null && stock !== undefined && parseInt(stock, 10) !== 0) {
      const find = await ResourceInventory.query()
        .where("product_id", productId)
        .whereNull("size_id")
        .first();

      if (find) {
        await ResourceInventory.query().where("id", find.id).update({
          inventory: stock,
        });
      } else {
        await ResourceInventory.create({
          product_id: productId,
          inventory: stock,
        });
      }
    }
  }

  async manageSizes(variations, productId) {
    if (variations.length > 0) {
      let dataArr = null;

      (async () => {
        for (let i = 0; i < variations.length; i++) {
          const el = variations[i];
          const promotionalStart =
            el.promotionalStart !== null && el.promotionalStart !== ""
              ? await Helpers.dateToDatabase(el.promotionalStart, true)
              : null;
          const promotionalEnd =
            el.promotionalEnd !== null && el.promotionalEnd !== ""
              ? await Helpers.dateToDatabase(el.promotionalEnd, true)
              : null;
          const price = await Helpers.decimalToDatabase(el.price);
          const { name } = el;
          const promotionalPrice =
            el.promotionalPrice !== null && el.promotionalPrice !== ""
              ? await Helpers.decimalToDatabase(el.promotionalPrice)
              : null;

          if (el.id === null || el.id === "") {
            dataArr = {
              name,
              price,
              product_id: productId,
              promotional_price: promotionalPrice,
              promotional_start: promotionalStart,
              promotional_end: promotionalEnd,
            };

            const size = await ResourceSize.create(dataArr);

            await ResourceInventory.create({
              product_id: productId,
              size_id: size.id,
              inventory: el.stock,
            });
          } else {
            const find = await ResourceSize.find(el.id);

            if (find) {
              find.merge({
                name,
                price,
                promotional_price: promotionalPrice,
                promotional_start: promotionalStart,
                promotional_end: promotionalEnd,
              });
              await find.save();

              const findSizeInventory = await ResourceInventory.findBy(
                "size_id",
                find.id
              );

              if (findSizeInventory !== null) {
                findSizeInventory.merge({
                  inventory: el.stock,
                });
                await findSizeInventory.save();
              } else {
                await ResourceInventory.create({
                  product_id: productId,
                  size_id: find.id,
                  inventory: el.stock,
                });
              }
            }
          }
        }
      })();
    }
  }
}

module.exports = ProductController;
