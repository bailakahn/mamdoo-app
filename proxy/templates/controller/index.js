/**
 * this is not used to make the copy

 to change anything here for the newly created controller look at cli/controller.js
*/

const auth = require("@app/auth");
const { controller } = require("./units");
module.exports = async ({ req }) => {
  return await auth({ req }, async (user) => {
    return await controller();
  });
};
