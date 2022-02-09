const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const clientSchema = new Schema(
  {
    requestId: { type: Schema.Types.ObjectId, required: true, ref: "Ride" },
    clientId: { type: Schema.Types.ObjectId, ref: "Client" },
    driverId: { type: Schema.Types.ObjectId, ref: "Driver" },
    canceledAt: { type: Date, default: Date.now },
  },
  { collection: "rideCancelations" }
);

module.exports = model("RideCanceletion", clientSchema);
