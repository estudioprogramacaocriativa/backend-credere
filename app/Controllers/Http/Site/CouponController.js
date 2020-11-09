"use strict";

const Resource = use("App/Models/Coupom");

class CouponController {
  async show({ request, response }) {
    const { code } = request.all();
    const find = await Resource.findBy("code", code);

    if (find === null) {
      return response.status(400).json({
        data: {
          message: "",
        },
      });
    }

    return {
      data: {
        message: `O cupom ${find.name} foi aplicado. Você recebeu de desconto`,
      },
    };
  }
}

module.exports = CouponController;
