const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const locationSchema = new Schema({
  type: { type: String, required: true },
  coordinates: { type: Array, required: true },
});

const cabSchema = new Schema({
  model: { type: String, required: true },
  licensePlate: { type: String, required: true },
});

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
    password: { type: String, required: true },
    salt: { type: String, required: true },
    isOnline: { type: Boolean, default: false },
    active: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now },
    currentLocation: {
      type: locationSchema,
    },
    cab: { type: cabSchema },
    profilePicture: { type: String },
    cabLicense: { type: String },
    driverLicenseFront: { type: String },
    driverLicenseBack: { type: String },
  },
  { collection: "drivers" }
);

clientSchema.index({ currentLocation: "2dsphere" });

module.exports = model("Driver", clientSchema);
