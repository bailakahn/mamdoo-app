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
      const requestId = await saveRequest({ userId, coordinates });

      const nearByDrivers = await getDrivers(coordinates);

      const { producer } = req;

      let payload = [
        {
          topic: "requests",
          messages: JSON.stringify({
            event: "newRequest",
            recipients: nearByDrivers,
            data: { requestId },
          }),
        },
      ];

      producer.send(payload, (err, data) => {
        if (err) console.log(err);
        // else console.log({ data });
      });
    }
  );
};
