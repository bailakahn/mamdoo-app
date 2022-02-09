const escape = require("striptags");
module.exports = (req, allowedTags) => {
  const { body } = req;
  // Object.keys(body).forEach((key) => {
  //   if (typeof body[key] === "string") sanatizedBody[key] = escape(body[key]);
  //   else if (typeof body[key] === "object") {
  //     sanatizedBody[key] = body[key];
  //   }
  // });

  traverse(body, allowedTags);
  return body;
};

const traverse = (body, allowedTags) => {
  Object.keys(body).forEach((key) => {
    if (typeof body[key] === "string")
      body[key] = escape(body[key], allowedTags);
    else if (Object.prototype.toString.call(body[key]) === "[object Object]")
      traverse(body[key], allowedTags);
    else if (Object.prototype.toString.call(body[key]) === "[object Array]")
      traverse(body[key], allowedTags);
    else body[key] = body[key];
  });
};
