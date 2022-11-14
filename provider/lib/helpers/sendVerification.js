const addMinutes = require("date-fns/addMinutes");
const { send } = require("_lib/orange");
const { get, error } = require("_lib/helpers");
const { SMSVerification } = require("_db/models");
const randomNumber = require("./randomNumber");

const message = {
  1006: {
    fr: "Mamdoo: Votre code de vérification est: {{code}}. Ne le partagez avec personne",
    en: "Mamdoo: Your verification code is: {{code}}. Don't share it with anyone",
  },
  1007: {
    fr: "Mamdoo: Votre code de réinitialisation de code pin est: {{code}}. SI vous n'avez pas demandé a réinitialiser votre code pin veuillez nous contacter immédiatement.",
    en: "Mamdoo: Your pin reset code is : {{code}}. If you didn't request a pin reset please contact us immediately.",
  },
};

module.exports = async ({ app, userId, messageId }) => {
  if (!app || !userId)
    error("SendVerificationError", "app and userId are required values");

  const model = app === "client" ? "Client" : "Driver";

  const user = await get(
    model,
    { _id: userId },
    { one: true, fields: ["_id", "lang"] }
  );

  if (!user) {
    error("GetUserError", "[SendVerification] Could not find user");
  }

  if (!message?.[messageId])
    error("GetMessageError", "[SendVerification] Could not find message");

  const code = randomNumber();

  const result = await send({
    userId,
    app,
    message: message[messageId][user?.lang || "fr"]
      .split("{{code}}")
      .join(code),
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
