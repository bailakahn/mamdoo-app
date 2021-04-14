const { getUser } = require("./units");
const auth = require("_app/auth");

module.exports = async ({ req, res }) => {
  return await auth(
    {
      req,
    },
    async ({ userId, accessToken, app }) => {
      const { producer } = req;

      let payload = [
        {
          topic: "dev_topic_2",
          messages: JSON.stringify({
            controller: "requests/newRequest",
            event: "dynamic",
            recipients: [`client-${userId}`],
            data: { baila: false },
          }),
        },
      ];

      producer.send(payload, (err, data) => {
        if (err) console.log(err);
        // else console.log({ data });
      });

      return await getUser();
    }
  );
};
