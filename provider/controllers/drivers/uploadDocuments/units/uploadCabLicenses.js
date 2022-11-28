const { putObject } = require("_lib/aws/s3Client");
const { validateImage } = require("_LIB/helpers");
const { Driver } = require("_db/models");

module.exports = async (userId, cabLicense) => {
  const Bucket = `mamdoo-${process.env.ENV_NAME}-bucket`;
  const { type, buffer } = validateImage(cabLicense);
  const timestamp = Date.now().toString();
  const filename = `documents/${userId}/cabLicenses/${timestamp}.${type}`;

  try {
    await putObject({
      Bucket,
      ContentType: `image/${type}`,
      ContentEncoding: "base64",
      Key: filename,
      Body: buffer,
    });

    await Driver.findByIdAndUpdate(userId, { cabLicense: filename });
    return filename;
  } catch (err) {
    console.log("[UploadFailed]: Could not upload cabLicense");
    console.log(err);
    return null;
  }
};
