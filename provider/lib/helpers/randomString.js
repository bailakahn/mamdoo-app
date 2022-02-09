const crypto = require("crypto");
module.exports = (length = 8) =>
  crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
