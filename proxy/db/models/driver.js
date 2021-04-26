const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const locationSchema = new Schema({
  type: { type: String, required: true },
  coordinates: { type: Array, required: true },
});

const clientSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: {
      type: String,
      required: true,
    },
    isOnline: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    currentLocation: {
      type: locationSchema,
    },
  },
  { collection: "drivers" }
);

clientSchema.index({ currentLocation: "2dsphere" });

module.exports = model("Driver", clientSchema);
