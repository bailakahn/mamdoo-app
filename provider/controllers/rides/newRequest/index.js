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
      const { coordinates } = getBody(req);
      const nearByDrivers = await getDrivers(coordinates);

      send("partner", 1000, nearByDrivers);
      const requestId = await saveRequest({
        userId,
        coordinates,
        nearByDrivers,
      });

      if (nearByDrivers.length) {
        const producer = await kafka.producer();

        let payload = {
          topic: "requestCreated",
          messages: [
            {
              value: JSON.stringify({
                event: "NEW_REQUEST",
                recipients: nearByDrivers,
                data: {
                  requestId,
                  coordinates,
                  clientId: userId,
                  drivers: nearByDrivers,
                },
              }),
            },
          ],
        };
        await producer.send(payload).then(console.log);
      }

      return { success: true, foundDrivers: nearByDrivers.length };
    }
  );
};
