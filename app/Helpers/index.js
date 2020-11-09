/* eslint-disable no-plusplus */

"use strict";

const { parseISO } = require("date-fns");
const { zonedTimeToUtc } = require("date-fns-tz");

class Helpers {
  static toNumber(string) {
    if (!Number.isInteger(string)) return string.replace(/\D/g, "");

    return string;
  }

  static cpfValidate(strCPF) {
    let Soma = 0;
    let Resto;

    const cpf = String(strCPF);

    if (cpf === "00000000000") return false;

    for (let i = 1; i <= 9; i++)
      Soma += parseInt(cpf.substring(i - 1, i), 10) * (11 - i);
    Resto = (Soma * 10) % 11;

    if (Resto === 10 || Resto === 11) Resto = 0;
    if (Resto !== parseInt(cpf.substring(9, 10), 10)) return false;

    Soma = 0;
    for (let i = 1; i <= 10; i++)
      Soma += parseInt(cpf.substring(i - 1, i), 10) * (12 - i);
    Resto = (Soma * 10) % 11;

    if (Resto === 10 || Resto === 11) Resto = 0;
    if (Resto !== parseInt(cpf.substring(10, 11), 10)) return false;
    return true;
  }

  static friendlyUrl(input = null, ligature = null) {
    if (input === null) return null;

    const withAccent =
      "ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝŔÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿŕ";
    const withoutAccent =
      "AAAAAAACEEEEIIIIDNOOOOOOUUUUYRsBaaaaaaaceeeeiiiionoooooouuuuybyr";
    const specialCharactere = ` !"#$%&'()*+,-./:;<=>?@[\\]^_\`{|}~`;

    let newString = "";

    for (let i = 0; i < input.length; i++) {
      let change = false;

      for (let a = 0; a < withAccent.length; a++) {
        if (input.substr(i, 1) === withAccent.substr(a, 1)) {
          newString += withoutAccent.substr(a, 1);
          change = true;
          break;
        }
      }

      for (let b = 0; b < specialCharactere.length; b++) {
        if (input.substr(i, 1) === specialCharactere.substr(b, 1)) {
          newString += " ";
          change = true;
          break;
        }
      }

      if (change === false) {
        newString += input.substr(i, 1);
      }
    }

    newString = newString.toLowerCase().split(" ");

    newString = newString.filter((el) => {
      return el !== "";
    });

    const slug = ligature !== null ? ligature : "-";

    return newString.join(slug);
  }

  /**
   * Format number to MySQL database
   * @param {decimal} myNumber
   * @returns {decimal}
   */
  static decimalToDatabase(myNumber) {
    const removeDot = String(myNumber).replace(".", "");
    const final = String(removeDot).replace(",", ".");

    return final;
  }

  static dateToDatabase(date, hour = false) {
    let parsedDate;
    let splitDate;
    let dateString;
    let hourString;
    let splitStringDate;
    let newDate;

    const timeZone = "America/Sao_Paulo";

    if (hour) {
      splitDate = date.split(" ");
      [dateString, hourString] = splitDate;

      splitStringDate = dateString.split("/");
      newDate = `${splitStringDate[2]}-${splitStringDate[1]}-${splitStringDate[0]}T${hourString}`;
      parsedDate = parseISO(newDate);

      return zonedTimeToUtc(parsedDate, timeZone);
    }

    splitStringDate = date.split("/");
    newDate = `${splitStringDate[2]}-${splitStringDate[1]}-${splitStringDate[0]}T00:00`;
    parsedDate = parseISO(newDate);

    return zonedTimeToUtc(parsedDate, timeZone);
  }

  static convertRole(role) {
    let newRole;

    switch (role) {
      case "master":
        newRole = "Administrador";
        break;
      case "reseler":
        newRole = "Revendedor";
        break;
      case "client":
        newRole = "Cliente";
        break;
      default:
        newRole = "Não definido";
    }

    return newRole;
  }

  static async generateCharacteres(length) {
    const radom13chars = () => Math.random().toString(16).substring(2, 15);

    const loops = Math.ceil(length / 13);

    return new Array(loops)
      .fill(radom13chars)
      .reduce((string, func) => {
        return string + func();
      }, "")
      .substring(0, length);
  }
}

module.exports = Helpers;
