const { get } = require("_lib/helpers");
const userList = require("_lib/userList");
module.exports = async (io, message) => {
  const { event = "", recipients = [], data, toClearDrivers } = JSON.parse(
    message.value
  );

  // TODO: remove hardcoded driver id
  const driver = await get(
    "Driver",
    { _id: data.driverId, deleted: false },
    { one: true, fields: ["_id", "firstName", "lastName", "phoneNumber"] }
  );

  if (event && recipients) {
    recipients.forEach((user) => {
      if (userList.userList[user])
        io.to(userList.userList[user].socketId).emit(event, {
          driver,
          requestId: data._id,
        });
    });
  }

  if (toClearDrivers)
    toClearDrivers.forEach((user) => {
      if (userList.userList[user])
        io.to(userList.userList[user].socketId).emit(event, {
          driver,
          requestId: data.requestId,
        });
    });
};
