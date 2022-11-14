const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const receiptSchema = new Schema(
  {
    clientId: { type: Schema.Types.ObjectId, ref: "Client" },
    driverId: { type: Schema.Types.ObjectId, ref: "Driver" },
    resourceId: { type: String, required: true },
    status: {
      type: String,
      enum: ["uncertain", "network", "failed", "waiting", "success"],
      default: "uncertain",
    },
    createdAt: { type: Date, default: Date.now },
    modifiedAt: { type: Date },
    deleted: { type: Boolean, default: false },
  },
  { collection: "smsReceipts" }
);

module.exports = model("SMSReceipt", receiptSchema);
