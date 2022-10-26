module.exports = {
  async up(db, client) {
    await db.collection("settings").insertOne(
      {
        key: "maxDistance",
        value: "1000",
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
      .deleteOne({ key: "maxDistance" }, function (err, res) {
        if (err) throw err;
        console.log("1 document deleted");
      });
  },
};
