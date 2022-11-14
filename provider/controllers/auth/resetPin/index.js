const { resetPin, getUser, verifyCode } = require("./units");
const { getBody, error } = require("_lib/helpers");

module.exports = async ({ req, res }) => {
  const { phoneNumber, pin, pinValidation, code } = getBody(req);
  if (!pin || !phoneNumber || !pinValidation || pin.length !== 4) {
    error("BadRequest", "[ResetPin] Missing required parameters");
  }

  const user = await getUser(phoneNumber);

  await verifyCode({ app: "client", userId: user?.userId, code });

  await resetPin(user, pin);

  return user;
};
