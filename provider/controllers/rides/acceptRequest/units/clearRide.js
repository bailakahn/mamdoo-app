module.exports = async ({ producer }, drivers, id) => {
  let payload = [
    {
      topic: "clearRides",
      messages: JSON.stringify({
        event: "RESET_REQUEST",
        recipients: drivers,
        data: { requestId: id, drivers },
      }),
    },
  ];

  producer.send(payload, (err, data) => {
    if (err) console.log(err);
    // else console.log({ data });
  });
};
