const models = require("_db/models");
module.exports = async (model, query, { one, fields = [] }) =>
  await models[model][one ? "findOne" : "find"](query)
    .select(fields.join(" "))
    .lean();
