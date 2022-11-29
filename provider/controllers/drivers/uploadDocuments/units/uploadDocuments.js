const { validateImage } = require("_LIB/helpers");
const { putObjects } = require("_lib/aws/s3Client");
const { Driver } = require("_db/models");
const Bucket = `mamdoo-${process.env.ENV_NAME}-bucket`;

const imageTypes = [
  "profilePicture",
  "driverLicenseFront",
  "driverLicenseBack",
  "cabLicense",
];

module.exports = async (userId, images = {}) => {
  console.log("[UploadDocuments] Uploading driver documents");

  const { s3Puts, types } = imageTypes.reduce(
    (acc, imageType) => {
      if (images[imageType]) {
        const { filename, ...rest } = getUploadData(
          userId,
          images[imageType],
          imageType
        );
        acc.s3Puts.push(rest);
        acc.types[imageType] = filename;
      }
      return acc;
    },
    { s3Puts: [], types: {} }
  );
  console.log("[UploadDocuments] Built S3 Upload objects");

  await putObjects(s3Puts);

  console.log("[UploadDocuments] Successfully uploaded documents");

  await Driver.findByIdAndUpdate(userId, {
    ...types,
    active: true,
    status: "pending",
  });

  console.log("[UploadDocuments] Successfully updated driver data");

  return { active: true };
};

const getUploadData = (userId, image, imageType) => {
  const { type, buffer } = validateImage(image);
  const timestamp = Date.now().toString();
  const filename = `documents/${userId}/${imageType}/${timestamp}.${type}`;

  return {
    Bucket,
    ContentType: `image/${type}`,
    ContentEncoding: "base64",
    Key: filename,
    Body: buffer,
    filename,
  };
};
