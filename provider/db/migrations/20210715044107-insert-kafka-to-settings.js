module.exports = {
  async up(db, client) {
    await db.collection("settings").insertOne(
      {
        key: "kafka_client_id",
        value: "mamdoo-app",
        serialized: false,
      },
      function (err, res) {
        if (err) throw err;
        console.log("1 document inserted");
      }
    );
    await db.collection("settings").insertOne(
      {
        key: "kafka_brokers",
        value: '["localhost:9092"]',
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
      .deleteOne({ key: "kafka_client_id" }, function (err, res) {
        if (err) throw err;
        console.log("1 document deleted");
      });

      await db
      .collection("settings")
      .deleteOne({ key: "kafka_brokers" }, function (err, res) {
        if (err) throw err;
        console.log("1 document deleted");
      });
  },
};
