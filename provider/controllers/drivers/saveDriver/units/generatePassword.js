const argon2 = require("argon2");
const { randomString } = require("_lib/helpers");
module.exports = async ({ password }) => {
  const salt = randomString(10);

  const hashedPassword = await argon2.hash(`${password}${salt}`, {
    type: argon2.argon2id,
    hashLength: 50,
  });

  return { password: hashedPassword, salt };
};
