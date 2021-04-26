const userList = {};

module.exports = {
  addUser: (user, socket) => {
    userList[user] = { socketId: socket.id };
  },
  removeUser: (socket) => {
    for (const key in userList) {
      if (socket.id === userList[key].socketId) {
        var userId = key;
        delete userList[key];
      }
    }
    return userId;
  },
  userList,
};
