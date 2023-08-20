const mongoose = require("mongoose");

const withdrawRequestSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      // required: true,
    },
    status: {
      type: String,
      default: "pending",
    },
    bankname: {
      type: String,
      required: true,
    },
    accountname: {
      type: String,
      required: true,
    },
    accountnumber: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("WithdrawRequest", withdrawRequestSchema);
