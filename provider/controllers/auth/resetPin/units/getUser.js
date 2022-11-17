const { error, get } = require("_lib/helpers");
const authenticate = require("_app/auth/authenticate");
const { Client } = require("_db/models");

module.exports = async (phoneNumber) => {
  const user = await get(
    "Client",
    { phoneNumber, deleted: false },
    {
      one: true,
      fields: [
        "_id",
        "firstName",
        "lastName",
        "phoneNumber",
        "pin",
        "expoPushToken",
      ],
    }
  );

  if (!user) error("AuthError", "This user does not exist", "errors.login");

  // remove expo push token
  if (user.expoPushToken)
    await Client.findByIdAndUpdate(user._id, { expoPushToken: null });

  delete user.pin;
  delete user.expoPushToken;

  const accessToken = await authenticate(user._id);
  const userId = user._id;
  delete user._id;

  return { ...user, accessToken, userId };
};