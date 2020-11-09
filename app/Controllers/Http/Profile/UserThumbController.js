'use strict';

const Resource = use('App/Models/User');
const messageFail =
  'Não foi possível identificar a sua conta. Por favor, atualize a página e tente novamente!';

class UserThumbController {
  async update({ request, response, auth }) {
    const authUser = await auth.getUser();
    const { mediaId } = request.all();

    if (!authUser) {
      return response.status(401).json({
        data: {
          message: messageFail,
        },
      });
    }

    await Resource.query().where('id', authUser.id).update({
      media_id: mediaId,
    });

    return {
      data: {
        message: 'Sua imagem de perfil foi atualizada com sucesso!',
      },
    };
  }
}

module.exports = UserThumbController;
