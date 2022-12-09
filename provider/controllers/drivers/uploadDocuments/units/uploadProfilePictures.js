const { putObject } = require("_lib/aws/s3Client");
const { validateImage } = require("_lib/helpers");
const { Driver } = require("_db/models");

module.exports = async (userId, profilePicture) => {
  const Bucket = `mamdoo-${process.env.ENV_NAME}-bucket`;
  const { type, buffer } = validateImage(profilePicture);
  const timestamp = Date.now().toString();
  const filename = `documents/${userId}/profilePictures/${timestamp}.${type}`;
  try {
    await putObject({
      Bucket,
      ContentType: `image/${type}`,
      ContentEncoding: "base64",
      Key: filename,
      Body: buffer,
    });

    await Driver.findByIdAndUpdate(userId, { profilePicture: filename });

    return filename;
  } catch (err) {
    console.log("[UploadFailed]: Could not upload profile picture");
    console.log(err);
    return null;
  }
};
