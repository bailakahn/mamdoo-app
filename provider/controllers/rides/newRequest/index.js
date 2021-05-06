const { newRequest, saveRequest, getDrivers } = require("./units");
const auth = require("_app/auth");
const { getBody } = require("_lib/helpers");
module.exports = async ({ req, res }) => {
  return await auth(
    {
      req,
    },
    async ({ userId, accessToken, app }) => {
      const { coordinates } = getBody(req);
      const nearByDrivers = await getDrivers(coordinates);

      const requestId = await saveRequest({
        userId,
        coordinates,
        nearByDrivers,
      });

      const { producer } = req;

      let payload = [
        {
          topic: "requestCreated",
          messages: JSON.stringify({
            event: "NEW_REQUEST",
            recipients: nearByDrivers,
            data: {
              requestId,
              coordinates,
              clientId: userId,
              drivers: nearByDrivers,
            },
          }),
          partition: 0,
        },
      ];

      producer.send(payload, (err, data) => {
        if (err) console.log(err);
        // else console.log({ data });
      });
    }
  );
};
