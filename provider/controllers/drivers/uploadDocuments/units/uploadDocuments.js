const { Driver } = require("_db/models");

module.exports = async (userId) => {
  await Driver.findByIdAndUpdate(userId, { active: true });

  return { active: true };
};
