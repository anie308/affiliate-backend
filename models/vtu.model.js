const mongoose = require("mongoose");

const vtuSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    phonenumber: {
      type: String,
      required: true,
    },
    phoneline: {
      type: String,
      required: true,
    },
    dataplan: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VTU", vtuSchema);
