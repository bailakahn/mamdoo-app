const { error } = require("_lib/helpers");

module.exports = (picture) => {
  const buffer = Buffer.from(
    picture.replace(/^data:image\/\w+;base64,/, ""),
    "base64"
  );

  const type = picture.substring(
    "data:image/".length,
    picture.indexOf(";base64")
  );

  if (!["png", "jpg", "gif", "jpeg"].includes(type))
    error("TypeError", "Inavlid image type uploaded");

  return { buffer, type };
};
