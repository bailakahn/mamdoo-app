const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const settingSchema = new Schema(
  {
    key: { type: String, required: true },
    value: {
      type: String,
      required: true,
      get: function (data) {
        try {
          return JSON.parse(data);
        } catch (err) {
          return data;
        }
      },
      set: function (data) {
        return JSON.stringify(data);
      },
    },
    serialized: { type: Boolean, default: false },
  },
  { collection: "settings" }
);

module.exports = model("Setting", settingSchema);
