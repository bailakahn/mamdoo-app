const addMinutes = require("date-fns/addMinutes");
const { send } = require("_lib/orange");
const { get, error } = require("_lib/helpers");
const { SMSVerification } = require("_db/models");
const randomNumber = require("./randomNumber");

const message = {
  fr: "Mamdoo: Votre code de vérification est: {{code}}. Ne le partagez avec personne",
  en: "Mamdoo: Your verification code is: {{code}}. Don't share it with anyone",
};

module.exports = async ({ app, userId }) => {
  if (!app || !userId)
    error("SendVerificationError", "app and userId are required values");

  const model = app === "client" ? "Client" : "Driver";

  const user = await get(
    model,
    { _id: userId },
    { one: true, fields: ["_id", "lang"] }
  );

  if (!user) {
    error("GetUserError", "Could not find user");
  }

  const code = randomNumber();

  const result = await send({
    userId,
    app,
    message: message[user?.lang || "fr"].split("{{code}}").join(code),
  });

  if (!result)
    error("SendVerificationError", "Could not send verification sms");

  await SMSVerification.updateMany(
    { ...((app === "client" && { clientId: userId }) || { driverId: userId }) },
    { expiresAt: new Date() }
  );

  const newVerification = new SMSVerification({
    ...((app === "client" && { clientId: userId }) || { driverId: userId }),
    code,
    expiresAt: addMinutes(new Date(), 5),
  });

  await newVerification.save();
};
