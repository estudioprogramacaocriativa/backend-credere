'use strict'

const Resource = use("App/Models/ProductSize");

class ProductSizeController {
  async destroy({ params, response }) {
    const resource = await Resource.find(params.id);

    if (!resource) {
      return response.status(404).json({
        data: {
          message: "A variação de tamanho solicitada não foi encontrada!",
        },
      });
    }

    try {
      await resource.delete();

      return {
        data: {
          message: "A variação de tamanho foi deletada permanentemente!",
        },
      };
    } catch( e ) {
      return response.status(400).json({
        data: {
          message: "Não foi possível remover a variação de tamanho no momento!",
        },
      });
    }
  }
}

module.exports = ProductSizeController
