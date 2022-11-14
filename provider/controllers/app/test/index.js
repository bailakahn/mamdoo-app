const { test } = require("./units");
const { sendVerification } = require("_lib/helpers");

module.exports = async ({ req, res }) => {
  await sendVerification({
    userId: "625e1ecb924d8148b3245fea",
    app: "client",
  });
};
