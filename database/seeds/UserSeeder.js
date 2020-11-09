"use strict";

const Database = use("Database");
const User = use("App/Models/User");

class UserSeeder {
  async run() {
    await Database.raw("SET FOREIGN_KEY_CHECKS = 0;");
    await User.truncate();
    await Database.raw("SET FOREIGN_KEY_CHECKS = 1;");

    await User.create({
      email: "dev@programacaocriativa.com.br",
      password: "12345678",
      name: "Samuel",
      role: "master",
    });

    await User.create({
      email: "isaquerenovato@gmail.com",
      password: "12345678",
      name: "Isaque",
      role: "master",
    });

    await User.create({
      email: "felipedramalho@gmail.com",
      password: "12345678",
      name: "Felipe",
      role: "master",
    });

    await User.create({
      email: "giovanni-g@hotmail.com",
      password: "12345678",
      name: "Giovanni",
      role: "master",
    });

    await User.create({
      email: "reseler@gmail.com",
      password: "12345678",
      name: "Revendedor",
      role: "reseler",
    });

    await User.create({
      email: "client@gmail.com",
      password: "12345678",
      name: "Cliente",
      role: "client",
    });
  }
}

module.exports = UserSeeder;
