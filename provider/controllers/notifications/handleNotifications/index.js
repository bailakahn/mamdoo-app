const { handleNotifications } = require("./units");
const auth = require("_app/auth");
const { getBody, error } = require("_lib/helpers");
const acceptedEvents = ["NEW_REQUEST"];
module.exports = async ({ req, res }) => {
  return await auth(
    {
      req,
    },
    async ({ userId, accessToken, app }) => {
      const data = getBody(req);
      if (
        !data ||
        !data.topic ||
        !data.event ||
        !acceptedEvents.includes(data.event)
      )
        error(
          "BadRequest",
          "Could not access resource",
          "errors.crashErrorTitle"
        );

      return await handleNotifications(userId, data);
    }
  );
};
