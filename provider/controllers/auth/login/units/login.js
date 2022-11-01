const argon2 = require("argon2");
const { error, get } = require("_lib/helpers");
const authenticate = require("_app/auth/authenticate");
const { Driver } = require("_db/models");
module.exports = async ({ phoneNumber, password }) => {
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
      ],
    }
  );

  if (!user) error("AuthError", "This user does not exist", "errors.login");

  const isValid = await argon2.verify(
    user.password,
    `${password}${user.salt}`,
    {
      type: argon2.argon2id,
      hashLength: 50,
    }
  );

  if (!isValid) error("AuthError", "This user does not exist", "errors.login");

  // remove expo push token
  if (user.expoPushToken)
    await Driver.findByIdAndUpdate(user._id, { expoPushToken: null });

  delete user.password;
  delete user.salt;

  const accessToken = await authenticate(user._id);
  const userId = user._id;
  delete user._id;
  return { ...user, accessToken, userId };
};
