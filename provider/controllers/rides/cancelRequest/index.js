const {
  cancelRequest,
  notifyDrivers,
  getDrivers,
  getRequest,
} = require("./units");
const auth = require("_app/auth");
const { getBody } = require("_lib/helpers");
const get = require("_lib/helpers/get");
const kafka = require("_lib/kafka");
const { send } = require("_lib/expo");

module.exports = async ({ req, res }) => {
  return await auth(
    {
      req,
    },
    async ({ userId, accessToken, app }) => {
      const { requestId } = getBody(req);

      const {
        pickUp: { coordinates },
        ...request
      } = await getRequest(requestId);

      await cancelRequest(requestId, app, userId);

      const producer = await kafka.producer();

      if (app === "partner") {
        const nearByDrivers = await getDrivers(coordinates);

        send("partner", 1000, nearByDrivers);

        let payload = {
          topic: "requestCreated",
          messages: [
            {
              value: JSON.stringify({
                event: "NEW_REQUEST",
                // TODO: test other drivers receiving the ride
                recipients: nearByDrivers.filter(
                  (driver) => driver != `${userId}`
                ),
                data: { requestId, driverId: userId, ...request },
              }),
            },
          ],
        };

        await producer.send(payload);
      }

      //   TODO: implement fucntion to notify ride driver
      await notifyDrivers({ producer, request, app, driverId: userId });
    }
  );
};
