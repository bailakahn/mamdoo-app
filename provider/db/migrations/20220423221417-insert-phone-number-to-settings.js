module.exports = {
  async up(db, client) {
    await db.collection("settings").insertOne(
      {
        key: "phone",
        value: "621083616",
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
      .deleteOne({ key: "phone" }, function (err, res) {
        if (err) throw err;
        console.log("1 document deleted");
      });
  },
};
