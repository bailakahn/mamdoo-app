module.exports = {
  async up(db, client) {
    await db.collection("settings").insertOne(
      {
        key: "googleMapsApiKey",
        value: "AIzaSyAOms3z5wGZja5MI8bZdgJ8C6ccOYaY78M",
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
      .deleteOne({ key: "googleMapsApiKey" }, function (err, res) {
        if (err) throw err;
        console.log("1 document deleted");
      });
  },
};
