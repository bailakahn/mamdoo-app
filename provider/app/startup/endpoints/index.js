const getDirectories = require("./getDirectories");
const mainDirectory = "controllers";

const endpointHandler = require("./endpointHandler");

module.exports = (app, producer) => {
  // get all directories from `mainDirectory`
  const directories = getDirectories(mainDirectory);

  // for each directory get all the endpoints that are in there
  for (let dir of directories) {
    const endpoints = getDirectories(`${mainDirectory}/${dir}`);

    for (let endpoint of endpoints) {
      // get the endpoint config
      const {
        Method,
        Routes,
      } = require(`../../../${mainDirectory}/${dir}/${endpoint}/config.json`);

      // get the endpoint handler
      const handler = require(`../../../${mainDirectory}/${dir}/${endpoint}`);

      // add endpoint to express router
      app[Method.toLowerCase()](
        `/${dir}/${endpoint}`,
        async (req, res, next) => {
          // get scopes from endpoints config
          req.producer = producer;
          // run endpoint handler
          handler({ req, res, next })
            .then((response) => {
              res.status(200).send(response || { success: true });
            })
            .catch((err) => {
              next(err);
            });
        }
      );

      // add custom route
      /**
       * Optional: to get shorter routes or add params in url
       */
      if (Routes) {
        for (let route of Routes) {
          route = route.replace(/^\/|\/$/g, "");
          app[Method.toLowerCase()](
            `/${dir}/${route}`,
            async (req, res, next) => {
              // get scopes from endpoints config
              req.producer = producer;
              handler({ req, res, next })
                .then((response) => {
                  res.status(200).send(response || { success: true });
                })
                .catch((err) => {
                  next(err);
                });
            }
          );
        }
      }
    }
  }
};
