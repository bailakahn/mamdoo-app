const { Client } = require("_db/models");
const { error } = require("_lib/helpers");
module.exports = async ({ phoneNumber }) => {
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
};
