const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
      unique: true,
    },
    vtuPortalOpen: {
      type: Boolean,
      default: false,
    },
    withdrawPortal: {
      type: Boolean,
      default: false,
    },

    username: {
      type: String,
      unique: true,
    },

    role: { type: String, default: "admin" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);
