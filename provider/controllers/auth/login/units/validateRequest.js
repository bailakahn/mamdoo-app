const { error } = require("_lib/helpers");
module.exports = async ({ phoneNumber, password }) => {
  if (phoneNumber.length !== 9 || isNaN(Number(phoneNumber)))
    error(
      "InvalidParam",
      "The phone number is not valid",
      "errors.phoneNumber"
    );

  if (!password.length || !/[a-zA-Z0-9]{8,}/.test(password))
    error("InvalidParam", "The password is not valid", "errors.passwordRegex");
};
