module.exports = {
  async up(db, client) {
    await db.createCollection("notifications", (err, res) => {
      if (err) throw err;

      console.log("Settings collection created successfully");
    });
  },

  async down(db, client) {
    await db.collection("notifications").drop(function (err, delOK) {
      if (err) throw err;
      console.log({ delOK });
      if (delOK) console.log("Collection deleted");
    });
  },
};
