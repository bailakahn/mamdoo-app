const escape = require("striptags");
module.exports = (req) => {
  const sanatizedBody = {};
  const { body } = req;
  Object.keys(body).forEach((key) => {
    if (typeof body[key] === "string") sanatizedBody[key] = escape(body[key]);
    else sanatizedBody[key] = body[key];
  });

  return sanatizedBody;
};
