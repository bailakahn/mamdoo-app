const userList = require("_lib/userList");
module.exports = async (io, message) => {
  const { event = "", recipients = [], data } = JSON.parse(message.value);

  if (event && recipients) {
    recipients.forEach((user) => {
      if (userList.userList[user])
        io.to(userList.userList[user].socketId).emit(event, data);
    });
  }
};
