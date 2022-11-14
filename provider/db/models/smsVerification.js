const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const verificationSchema = new Schema(
  {
    clientId: { type: Schema.Types.ObjectId, ref: "Client" },
    driverId: { type: Schema.Types.ObjectId, ref: "Driver" },
    code: { type: Number, required: true },
    isUsed: {
      type: Boolean,
      default: false,
    },
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date },
    expiresAt: { type: Date, required: true },
    deleted: { type: Boolean, default: false },
  },
  { collection: "smsVerification" }
);

module.exports = model("SMSVerification", verificationSchema);
