const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const clientSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: {
      type: String,
      required: true,
    },
    lang: { type: String },
    expoPushToken: { type: String, required: false },
    deleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { collection: "clients" }
);

module.exports = model("Client", clientSchema);
