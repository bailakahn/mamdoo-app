const { error } = require("_lib/helpers");
module.exports = async ({ phoneNumber, pin = "" }) => {
  if (phoneNumber.length !== 9 || isNaN(Number(phoneNumber)))
    error(
      "InvalidParam",
      "The phone number is not valid",
      "errors.phoneNumber"
    );

  if (!pin.length || pin.length !== 4)
    error("InvalidParam", "The pin code is not valid", "errors.pin");
};
