module.exports = {
  async up(db, client) {
    await db.collection("settings").insertOne(
      {
        key: "driverLastSeen",
        value: "24",
        serialized: false,
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
      .deleteOne({ key: "driverLastSeen" }, function (err, res) {
        if (err) throw err;
        console.log("1 document deleted");
      });
  },
};
