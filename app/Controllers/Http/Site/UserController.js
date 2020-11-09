'use strict'

const Resource = use('App/Models/User');

class UserController {
  async show ({ auth, response }) {
    try {
      const user = await auth.getUser();

      return { data: { user } };
    } catch (error) {
      return response.status(400).send({
        data: {
          message: "Requisição inválida",
        },
      });
    }
  }

  async update ({ auth, request, response }) {
    const user = await auth.getUser();

    try {
      const {
        name,
        last_name,
        cpf,
        birth_date,
        phone
      } = request.all();

      const find = await Resource.find(user.id);

      find.merge({
        name,
        last_name,
        cpf,
        birth_date,
        phone
      });

      await find.save();

      return {
        data: {
          message: 'Seus dados foram atualizados com sucesso!'
        }
      }
    } catch (error) {
      return response.status(400).send({
        data: {
          message: "Não foi possível atualizar seus dados! Por favor tente novamente em alguns segundos." + error,
        },
      });
    }
  }
}

module.exports = UserController
