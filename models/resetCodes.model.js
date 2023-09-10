const mongoose = require("mongoose");

const resetCodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Code", resetCodeSchema);
