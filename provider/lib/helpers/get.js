const models = require("_db/models");
module.exports = async (model, query, { one, fields = [], joins = [] }) => {
  const getQuery = models[model][one ? "findOne" : "find"](query)
    .select(fields.join(" "))
    .lean();

  joins.map(({ path, select }) => {
    getQuery.populate({ path, select });
  });

  return await getQuery;
};
