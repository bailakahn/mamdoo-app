const {
  uploadDocuments,
  uploadCabLicenses,
  uploadDriverLicenses,
  uploadProfilePictures,
} = require("./units");
const auth = require("_app/auth");
const { getBody } = require("_lib/helpers");

module.exports = async ({ req, res }) => {
  return await auth(
    {
      req,
    },
    async ({ userId, accessToken, app }) => {
      const images = getBody(req);

      // profilePicture && (await uploadProfilePictures(userId, profilePicture));

      // driverLicenseFront &&
      //   driverLicenseBack &&
      //   (await uploadDriverLicenses(
      //     userId,
      //     driverLicenseFront,
      //     driverLicenseBack
      //   ));

      // cabLicense && (await uploadCabLicenses(userId, cabLicense));

      return await uploadDocuments(userId, images);
    }
  );
};
