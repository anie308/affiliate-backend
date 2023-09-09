const mongoose = require("mongoose");

const vtuSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    type:{
      type: String,
      required: true,
    },
    phonenumber: {
      type: String,
      required: true,
    },
    network: {
      type: String,
      required: true,
    },
    plan: {
      type: String,
    },
    duration: {
      type: String,
    },
    amount: {
      type: String,
    },
    points: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VTU", vtuSchema);
