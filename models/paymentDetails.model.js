const mongoose = require("mongoose");

const bankDetailsSchema = new mongoose.Schema(
  {
    accountnumber: {
      type: String,
      required: true,
    },
    accountname: {
      type: String,
      required: true,
    },
    bankname: {
        type: String,
        required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BankDetails", bankDetailsSchema);
