const { error, get } = require("_lib/helpers");
module.exports = async (_id) => {
  const user = await get(
    "Client",
    { _id, deleted: false },
    {
      one: true,
      fields: ["_id", "firstName", "lastName", "phoneNumber", "isBlocked"],
    }
  );

  if (!user) error("AuthError", "This user does not exist", "errors.login");

  const userId = user._id;
  delete user._id;
  return { ...user, userId };
};
