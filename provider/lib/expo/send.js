const { get } = require("_lib/helpers");
const { Expo } = require("expo-server-sdk");
module.exports = async (app, eventId, userIds) => {
  const modelName = app === "client" ? "Client" : "Driver";

  const notification = await get(
    "Notification",
    { eventId },
    { one: true, fields: ["_id", "message"] }
  );

  if (!notification) return;

  const expo = new Expo();
  let messages = [];
  for (let _id of userIds) {
    const user = await get(
      modelName,
      { _id },
      { one: true, fields: ["_id", "expoPushToken", "lang"] }
    );
    if (!user) continue;

    if (!Expo.isExpoPushToken(user.expoPushToken)) {
      console.error(
        `Push token ${user.expoPushToken} is not a valid Expo push token`
      );
      continue;
    }

    messages.push({
      to: user.expoPushToken,
      sound: "default",
      body: notification.message[(user.lang && user.lang) || "fr"],
      title: "Mamdoo",
    });
  }

  const chunks = expo.chunkPushNotifications(messages);
  let tickets = [];
  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log(ticketChunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error(error);
    }
  }

  return { success: true };
};
