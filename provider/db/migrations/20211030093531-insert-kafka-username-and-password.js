module.exports = {
  async up(db, client) {
    await db.collection("settings").insertOne(
      {
        key: "kafka_username",
        value: "PS6GGA7UKIRPISLI",
        serialized: false,
      },
      function (err, res) {
        if (err) throw err;
        console.log("1 document inserted");
      }
    );
    await db.collection("settings").insertOne(
      {
        key: "kafka_password",
        value:
          "AfTq3oJi6bwc/itIv+XIGump51WoZmK51itDVBpdNNMhSeAmKYxDJgzGIq+F/njS",
        serialized: true,
      },
      function (err, res) {
        if (err) throw err;
        console.log("1 document inserted");
      }
    );
  },

  async down(db, client) {
    await db
      .collection("settings")
      .deleteOne({ key: "kafka_username" }, function (err, res) {
        if (err) throw err;
        console.log("1 document deleted");
      });

    await db
      .collection("settings")
      .deleteOne({ key: "kafka_password" }, function (err, res) {
        if (err) throw err;
        console.log("1 document deleted");
      });
  },
};
