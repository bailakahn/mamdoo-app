const {
  cancelRequest,
  notifyDrivers,
  getDrivers,
  getRequest,
} = require("./units");
const auth = require("_app/auth");
const { getBody } = require("_lib/helpers");
const get = require("_lib/helpers/get");
module.exports = async ({ req, res }) => {
  return await auth(
    {
      req,
    },
    async ({ userId, accessToken, app }) => {
      const { requestId } = getBody(req);

      const {
        startLocation: { coordinates },
        ...request
      } = await getRequest(requestId);

      await cancelRequest(requestId, app);

      if (app === "partner") {
        const nearByDrivers = await getDrivers(coordinates);

        const { producer } = req;

        let payload = [
          {
            topic: "newrequest",
            messages: JSON.stringify({
              event: "NEW_REQUEST",
              // TODO: test other drivers receiving the ride
              recipients: nearByDrivers.filter(
                (driver) => driver != `driver-${userId}`
              ),
              data: { requestId },
            }),
            partition: 0,
          },
        ];

        producer.send(payload, (err, data) => {
          if (err) console.log(err);
          // else console.log({ data });
        });
      }

      //   TODO: implement fucntion to notify ride driver
      await notifyDrivers(req, { request, app });
    }
  );
};
