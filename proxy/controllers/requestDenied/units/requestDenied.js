const userList = require("_lib/userList");
module.exports = (io, message) => {
  const { event = "", recipients = [], data } = message;
  if (event && recipients) {
    recipients.forEach((user) => {
      if (userList.userList[user])
        io.to(userList.userList[user].socketId).emit(event, data);
    });
  }
};
