const argon2 = require("argon2");
const { error, get } = require("_lib/helpers");
const authenticate = require("_app/auth/authenticate");
module.exports = async ({ phoneNumber, pin }) => {
  const user = await get(
    "Client",
    { phoneNumber, pin, deleted: false },
    {
      one: true,
      fields: ["_id", "firstName", "lastName", "phoneNumber", "pin"],
    }
  );

  if (!user) error("AuthError", "This user does not exist", "errors.login");

  delete user.pin;

  const accessToken = await authenticate(user._id);
  const userId = user._id;
  delete user._id;
  return { ...user, accessToken, userId };
};
