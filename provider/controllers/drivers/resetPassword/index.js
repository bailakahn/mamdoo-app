const { resetPassword, getDriver, verifyCode } = require("./units");
const { getBody, error } = require("_lib/helpers");
const settings = require("_constants/settings");

module.exports = async ({ req, res }) => {
  const { phoneNumber, password, passwordValidation, code } = getBody(req);
  if (!password || !phoneNumber || !passwordValidation) {
    error(
      "BadRequest",
      "[ResetPassword] Missing required parameters",
      "errors.crashErrorTitle"
    );
  }

  if (password !== passwordValidation) {
    error(
      "InvalidParam",
      "The password is different than the password validation not valid",
      "errors.password"
    );
  }

  if (!password.length || !settings.REGEX.password.test(password))
    error("InvalidParam", "The password is not valid", "errors.passwordRegex");

  const user = await getDriver(phoneNumber);

  await verifyCode({ app: "partner", userId: user?.userId, code });

  await resetPassword(user, password);

  return user;
};
