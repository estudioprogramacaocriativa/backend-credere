/* eslint-disable arrow-parens */

"use strict";

const Resource = use("App/Models/ProductGallery");
const ResourceMedia = use("App/Models/Media");
const ResourceProduct = use("App/Models/Product");
const Helpers = use("Helpers");

class ProductImportGalleryController {
  async store({ request, response }) {
    const images = request.file("medias");

    if (!images) {
      return response.status(403).json({
        data: {
          message:
            "Informe ao menos uma mídia imagem para realizar o upload do arquivo para a galeria",
        },
      });
    }

    Array.from(images.files).forEach(async (el) => {
      const clientFileName = el.clientName;
      const filename = clientFileName.split(".").slice(0, -1).join(".");
      const separateName = filename.split("-");
      const productCode = separateName[0] !== null ? separateName[0] : filename;
      const principal =
        separateName[1] !== null && separateName[1] === "principal" ? 1 : 0;
      const findProduct = await ResourceProduct.findBy("code", productCode);

      if (findProduct !== null)
        await this.storeFile(el, principal, findProduct.id);
    });

    return {
      data: {
        message: "Suas imagens em lote, para produtos, foram processadas",
      },
    };
  }

  async storeFile(resource, principal, productId) {
    const fileName = resource.clientName;
    const filePath = `${Date.now()}-${resource.clientName}`;
    const extension = resource.extname;
    const { size, type } = resource;
    const findMedia = await ResourceMedia.findBy("name", fileName);

    if (findMedia !== null) {
      findMedia.merge({
        name: fileName,
        path: filePath,
        type,
        extension,
        size,
      });

      await findMedia.save();

      const findGallery = await Resource.query()
        .where("product_id", productId)
        .where("media_id", findMedia.id)
        .first();

      if (findGallery === null) {
        await Resource.create({
          is_cover: principal,
          media_id: findMedia.id,
          product_id: productId,
        });
      } else {
        findGallery.merge({
          is_cover: principal,
        });

        await findGallery.save();
      }
    } else {
      await resource.move(Helpers.publicPath("medias"), {
        name: filePath,
      });

      if (resource.moved()) {
        const media = await ResourceMedia.create({
          name: fileName,
          path: filePath,
          extension,
          type,
          size,
        });

        await Resource.create({
          is_cover: principal,
          media_id: media.id,
          product_id: productId,
        });
      }
    }
  }
}

module.exports = ProductImportGalleryController;
