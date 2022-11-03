module.exports = {
  async up(db, client) {
    await db.collection("settings").insertOne(
      {
        key: "maxCancelation",
        value: "3",
        serialized: false,
      },
      function (err, res) {
        if (err) throw err;
        console.log("1 document inserted");
      }
    );
    await db.collection("settings").insertOne(
      {
        key: "cancelationPeriod",
        value: "30",
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
      .deleteOne({ key: "maxCancelation" }, function (err, res) {
        if (err) throw err;
        console.log("1 document deleted");
      });

    await db
      .collection("settings")
      .deleteOne({ key: "cancelationPeriod" }, function (err, res) {
        if (err) throw err;
        console.log("1 document deleted");
      });
  },
};
