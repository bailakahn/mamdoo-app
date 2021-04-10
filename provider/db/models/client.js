const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const clientSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNumber: {
    type: String,
    required: true,
  },
  deleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = model("Client", clientSchema);
