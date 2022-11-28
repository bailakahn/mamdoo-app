const { putObject } = require("_lib/aws/s3Client");
const { validateImage } = require("_LIB/helpers");
const { Driver } = require("_db/models");

module.exports = async (userId, driverLicenseFront, driverLicenseBack) => {
  const Bucket = `mamdoo-${process.env.ENV_NAME}-bucket`;
  const { type, buffer } = validateImage(driverLicenseFront);
  const { type: backType, buffer: backBuffer } =
    validateImage(driverLicenseBack);
  const timestamp = Date.now().toString();

  let filenameFront = `documents/${userId}/driverLicensesFront/${timestamp}.${type}`;
  let filenameBack = `documents/${userId}/driverLicensesBack/${timestamp}.${backType}`;

  try {
    await putObject({
      Bucket,
      ContentType: `image/${type}`,
      ContentEncoding: "base64",
      Key: filenameFront,
      Body: buffer,
    });

    await Driver.findByIdAndUpdate(userId, {
      driverLicenseFront: filenameFront,
    });
  } catch (err) {
    console.log("[UploadFailed]: Could not upload driver license front");
    console.log(err);
    filenameFront = null;
  }

  try {
    await putObject({
      Bucket,
      ContentType: `image/${backType}`,
      ContentEncoding: "base64",
      Key: filenameBack,
      Body: backBuffer,
    });

    await Driver.findByIdAndUpdate(userId, {
      driverLicenseBack: filenameBack,
    });
  } catch (err) {
    console.log("[UploadFailed]: Could not upload driver license back");
    console.log(err);
    filenameBack = null;
  }

  return { filenameFront, filenameBack };
};
