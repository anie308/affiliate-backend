const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },
    phonenumber: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      unique: true,
    },
    couponcode: {
      type: String,
    },
    username: {
      type: String,
      unique: true,
    },
    referralCode: {
      type: String,
      required: true,
      unique: true,
    },
    plan: {
      type: Number,
      default: 0,
    },
    refCount:{
      type: Number,
      default: 0,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    bankDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BankDetails",
    },
    affiliatebalance: {
      type: Number,
      default: 0,
    },
    activitybalance: {
      type: Number,
      default: 0,
    },
    lastLogin: {
      type: Date,
    },
    role: { type: String, default: "user" },
  },
  { timestamps: true }
);


module.exports = mongoose.model("User", userSchema);
