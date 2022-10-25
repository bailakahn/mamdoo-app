const { Driver } = require("_db/models");
const { error } = require("_lib/helpers");
const settings = require("_constants/settings");
module.exports = async ({ phoneNumber, cab, password }) => {
  const driverExist = await Driver.findOne({ phoneNumber, deleted: false });
  if (driverExist)
    error(
      "DuplicateClient",
      "A client with this phone number already exists",
      "errors.duplicateClient"
    );

  if (phoneNumber.length !== 9 || isNaN(Number(phoneNumber)))
    error(
      "InvalidParam",
      "The phone number is not valid",
      "errors.phoneNumber"
    );

  if (!password.length || !settings.REGEX.password.test(password))
    error("InvalidParam", "The password is not valid", "errors.passwordRegex");

  if (!cab.model.length)
    error("InvalidParam", "The cab model is not valid", "errors.cabModel");

  if (
    !cab.licensePlate.length ||
    !settings.REGEX.licencePlate.test(cab.licensePlate)
  )
    error(
      "InvalidParam",
      "The license plate is not valid",
      "errors.licensePlate"
    );
};
