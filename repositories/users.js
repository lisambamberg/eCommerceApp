const fs = require("fs");
const crypto = require("crypto");
const util = require("util");
const Repository = require("./repository");

const scrypt = util.promisify(crypto.scrypt);

class UsersRepository extends Repository {
  async comparePasswords(saved, supplied) {
    const [hashed, salt] = saved.split(".");
    const hashedSuppliedBuffer = await scrypt(supplied, salt, 64);

    return hashed === hashedSuppliedBuffer.toString("hex");
  }

  async create(attributes) {
    attributes.id = this.randomId();

    const salt = crypto.randomBytes(8).toString("hex");
    const buffer = await scrypt(attributes.password, salt, 64);

    const records = await this.getAll();
    const record = {
      ...attributes,
      password: `${buffer.toString("hex")}.${salt}`,
    };
    records.push(record);

    await this.writeAll(records);

    return record;
  }

 
}

module.exports = new UsersRepository("users.json");
