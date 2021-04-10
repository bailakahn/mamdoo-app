module.exports = {
  async up(db, client) {
    await db.collection("settings").insertOne(
      {
        key: "jwt_passcode",
        value: "the best player in the world is Ronaldo",
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
      .deleteOne({ key: "jwt_passcode" }, function (err, res) {
        if (err) throw err;
        console.log("1 document deleted");
      });
  },
};
