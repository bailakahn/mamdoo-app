module.exports = {
  async up(db, client) {
    await db.collection("settings").insertOne(
      {
        key: "orangeBaseUrl",
        value: "https://api.orange.com/",
        serialized: false,
      },
      function (err, res) {
        if (err) throw err;
        console.log("1 document inserted");
      }
    );
    await db.collection("settings").insertOne(
      {
        key: "authorizationHeader",
        value: "",
        serialized: true,
      },
      function (err, res) {
        if (err) throw err;
        console.log("1 document inserted");
      }
    );
    await db.collection("settings").insertOne(
      {
        key: "devPhoneNumber",
        value: "2240000",
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
      .deleteOne({ key: "orangeBaseUrl" }, function (err, res) {
        if (err) throw err;
        console.log("1 document deleted");
      });

    await db
      .collection("settings")
      .deleteOne({ key: "authorizationHeader" }, function (err, res) {
        if (err) throw err;
        console.log("1 document deleted");
      });
    await db
      .collection("settings")
      .deleteOne({ key: "devPhoneNumber" }, function (err, res) {
        if (err) throw err;
        console.log("1 document deleted");
      });
  },
};
