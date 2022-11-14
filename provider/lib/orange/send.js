const axios = require("axios");
const { getSetting, error, get } = require("_lib/helpers");
const auth = require("./auth");
const { SMSReceipt } = require("_db/models");
module.exports = async ({ app, userId, message }) => {
  let results;
  try {
    if (!userId || !app || !message)
      error("MissingArguments", "Please provide recipient and message");

    const model = app === "client" ? "Client" : "Driver";

    const user = await get(
      model,
      { _id: userId },
      { one: true, fields: ["_id", "phoneNumber"] }
    );

    if (!user) {
      error("GetUserError", "Could not find user");
    }

    const access_token = await auth();
    const orangeBaseUrl = await getSetting("orangeBaseUrl");
    const devPhoneNumber = await getSetting("devPhoneNumber");

    let url =
      orangeBaseUrl +
      `smsmessaging/v1/outbound/${encodeURIComponent(
        "tel:+"
      )}${devPhoneNumber}/requests`;
    results = await axios({
      url,
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
      data: {
        outboundSMSMessageRequest: {
          address: `tel:+224${user?.phoneNumber}`,
          senderAddress: `tel:+${devPhoneNumber}`,
          outboundSMSTextMessage: {
            message: `${message}`,
          },
        },
      },
    });

    const resourceId = /[^/]*$/.exec(
      results?.data?.outboundSMSMessageRequest?.resourceURL
    )[0];

    const newReceipt = new SMSReceipt({
      ...((app === "client" && { clientId: userId }) || { driverId: userId }),
      resourceId,
    });

    await newReceipt.save();

    console.log("[SendSMS] Successfully sent SMS to " + userId);
    results = resourceId;
  } catch (sendSMSError) {
    console.log({ sendSMSError });
    results = false;
  }

  return results;
};
