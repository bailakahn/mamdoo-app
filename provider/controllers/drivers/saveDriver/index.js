const { saveDriver, validateRequest, generatePassword } = require("./units");
const authenticate = require("_app/auth/authenticate");
const { getBody, sendVerification } = require("_lib/helpers");
module.exports = async ({ req, res }) => {
  const newDriver = getBody(req);

  await validateRequest(newDriver);

  const secret = await generatePassword(newDriver);

  delete newDriver.password;

  const driverId = await saveDriver({ ...newDriver, ...secret });

  await sendVerification({ app: "partner", userId: driverId, messageId: 1006 });

  const accessToken = await authenticate(driverId);

  return { ...newDriver, accessToken, userId: driverId, active: false };
};
