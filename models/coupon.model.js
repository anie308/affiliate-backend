const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
    usedBy:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    generatedFor:{
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
