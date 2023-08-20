const mongoose = require("mongoose");

const notifySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    category:{
      type: String,
      // required: true,
    },
    createdBy:{
      type: String,
      required: true,
      default: "Admin"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notifySchema);
