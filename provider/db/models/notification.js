const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const notificationSchema = new Schema(
  {
    eventId: { type: Number, required: true },
    message: { type: Object, required: true },
    deleted: { type: Boolean, default: false },
  },
  { collection: "notifications" }
);

module.exports = model("Notification", notificationSchema);
