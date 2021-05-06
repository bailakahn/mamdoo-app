const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const locationSchema = new Schema({
  type: { type: String, required: true },
  coordinates: { type: Array, required: true },
});

const rideSchema = new Schema(
  {
    clientId: { type: Schema.Types.ObjectId, required: true, ref: "Client" },
    driverId: { type: Schema.Types.ObjectId, ref: "Driver" },
    status: {
      type: String,
      enum: ["request", "ongoing", "completed", "canceled"],
      default: "request",
    },
    pickUp: {
      type: locationSchema,
    },
    dropOff: {
      type: locationSchema,
    },
    endLocation: {
      type: locationSchema,
    },
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date },
    startTime: { type: Date },
    endTime: { type: Date },
    deleted: { type: Boolean, default: false },
    drivers: { type: Array },
  },
  { collection: "rides" }
);

module.exports = model("Ride", rideSchema);
