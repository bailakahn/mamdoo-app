const { get } = require("_lib/helpers");
const compareAsc = require("date-fns/compareAsc");
const { SMSVerification, Client, Driver } = require("_db/models");
module.exports = async ({ app, userId, code }) => {
  const query = app === "client" ? { clientId: userId } : { driverId: userId };

  const verification = await get(
    "SMSVerification",
    {
      ...query,
      code: Number(code),
      deleted: false,
    },
    { one: true, fields: ["_id", "code", "expiresAt", "isUsed"] }
  );

  if (!verification) return { success: false, notFound: true };

  if (verification?.isUsed) return { success: false, isUsed: true };

  if (compareAsc(verification?.expiresAt, new Date()) !== 1)
    return { success: false, expired: true };

  // update token
  await SMSVerification.findByIdAndUpdate(verification?._id, {
    isUsed: true,
    modifiedAt: Date.now(),
  });

  if (app === "client") {
    await Client.findByIdAndUpdate(userId, { verified: true });
  } else {
    await Driver.findByIdAndUpdate(userId, { verified: true });
  }

  return { success: true };
};
