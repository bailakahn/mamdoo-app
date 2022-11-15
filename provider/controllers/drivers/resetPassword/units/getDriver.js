const { error, get } = require("_lib/helpers");
const authenticate = require("_app/auth/authenticate");
const { Driver } = require("_db/models");

module.exports = async (phoneNumber) => {
  const user = await get(
    "Driver",
    { phoneNumber, deleted: false },
    {
      one: true,
      fields: [
        "_id",
        "firstName",
        "lastName",
        "phoneNumber",
        "isOnline",
        "active",
        "password",
        "salt",
        "cab",
        "expoPushToken",
        "verified",
      ],
    }
  );

  if (!user)
    error(
      "AuthError",
      "[ResetPassword] This user does not exist",
      "errors.login"
    );

  // remove expo push token
  if (user.expoPushToken)
    await Driver.findByIdAndUpdate(user._id, { expoPushToken: null });

  delete user.password;
  delete user.salt;
  delete user.expoPushToken;

  const accessToken = await authenticate(user._id);
  const userId = user._id;
  delete user._id;

  return { ...user, accessToken, userId };
};
