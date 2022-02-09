module.exports = {
  async up(db, client) {
    await db.collection("notifications").insertMany(
      [
        {
          eventId: 1000,
          message: {
            fr: "Vous avez une nouvelle demande de course",
            en: "You have a new ride request",
          },
          deleted: false,
        },
        {
          eventId: 1001,
          message: {
            fr: "Nous vous avons trouvé un Mamdoo",
            en: "We found you a Mamdoo",
          },
          deleted: false,
        },
        {
          eventId: 1002,
          message: {
            fr: "Votre Mamdoo est arrivé",
            en: "Your Mamdoo has arrived",
          },
          deleted: false,
        },
        {
          eventId: 1003,
          message: {
            fr: "Un autre Mamdoo a accepté la course",
            en: "Another Mamdoo got the ride",
          },
          deleted: false,
        },
        {
          eventId: 1004,
          message: {
            fr: "Le client a annulé la course",
            en: "The client canceled the ride",
          },
          deleted: false,
        },
        {
          eventId: 1005,
          message: {
            fr: "Votre course est terminée",
            en: "Your ride is done",
          },
          deleted: false,
        },
      ],
      function (err, res) {
        if (err) throw err;
        console.log("1 document inserted");
      }
    );
  },

  async down(db, client) {
    await db.collection("notifications").deleteMany({}, function (err, res) {
      if (err) throw err;
      console.log("1 document deleted");
    });
  },
};
