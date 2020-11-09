"use strict";

const Resource = use("App/Models/ProductCategory");

class ProductCategoryController {
  async index() {
    const resources = await Resource.query()
      .where("status", "published")
      .whereHas("products")
      .orderBy("title")
      .fetch();

    return {
      data: {
        resources,
      },
    };
  }
}

module.exports = ProductCategoryController;
