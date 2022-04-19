const { Client } = require("_db/models");
const { error } = require("_lib/helpers");
module.exports = async ({ phoneNumber, pin = "" }) => {
  const clientExists = await Client.findOne({ phoneNumber, deleted: false });
  if (clientExists)
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

  if (!pin || pin.length !== 4)
    error("InvalidParam", "The Pin Code is not valid", "errors.pin");
};
