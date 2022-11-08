const { newRequest, saveRequest, getDrivers } = require("./units");
const auth = require("_app/auth");
const { getBody } = require("_lib/helpers");
const kafka = require("_lib/kafka");
const { send } = require("_lib/expo");
module.exports = async ({ req, res }) => {
  return await auth(
    {
      req,
    },
    async ({ userId, accessToken, app }) => {
      const { coordinates, excludedDriver } = getBody(req);

      const nearByDrivers = await getDrivers(coordinates, excludedDriver);

      console.log("[NewRequest] found drriver", nearByDrivers);

      const requestId = await saveRequest({
        userId,
        coordinates,
        nearByDrivers,
      });

      if (nearByDrivers.length) {
        const producer = await kafka.producer();
        const data = {
          requestId,
          coordinates,
          clientId: userId,
          drivers: nearByDrivers,
        };

        let payload = {
          topic: "requestCreated",
          messages: [
            {
              value: JSON.stringify({
                event: "NEW_REQUEST",
                recipients: nearByDrivers,
                data,
              }),
            },
          ],
        };
        await producer.send(payload).then(console.log);
        await send("partner", 1000, nearByDrivers, {
          topic: "requestCreated",
          event: "NEW_REQUEST",
          payload: data,
        });
      }

      return { success: true, foundDrivers: nearByDrivers.length };
    }
  );
};
