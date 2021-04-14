const userList = require("_lib/userList");
module.exports = (io, message) => {
  const { event = "", recipients = [], data } = JSON.parse(message.value);

  if (event && recipients) {
    recipients.forEach((user) => {
      io.to(userList.userList[user].socketId).emit(event, data);
    });
  }
};
