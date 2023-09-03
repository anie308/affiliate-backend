const Coupon = require("../models/coupon.model");
const User = require("../models/user.model");
const { v4: uuidv4 } = require("uuid");

const generateCode = async (req, res) => {
  const { numberOfCodes, username } = req.body;
  try {
    const user = await User.findOne({ username });
    if (user.role !== "vendor")
      res.status(403).json({
        message: "User is not a vendor",
      });

    const codes = [];

    for (let i = 0; i < numberOfCodes; i++) {
      const code = uuidv4().substr(0, 8);
      const newCoupon = new Coupon({
        code,
        used: false,
        generatedFor: username, // Set the initial status for each code
      });
      await newCoupon.save();
      codes.push({
        code,
        used: false,
        generatedFor: username, // Set the initial status for each code
      });
    }

    res.status(200).json({
      codes,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

const getCodes = async (req, res) => {
  try {
    const codeCount = await Coupon.countDocuments();
    const allCodes = await Coupon.find({}).sort({
      createdAt: -1,
    });

    res.status(200).json({
      allCodes,
      codeCount,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

const confirmCode = async (req, res) => {
  const { code } = req.body;
  try {
    const coupon = Coupon.findOne({ code });
    if (coupon.used !== true) {
      res.status(201).json({
        message: "Coupon is still valid",
      });
    } else {
      res.status(201).json({
        message: "Coupon has already been used",
      });
    }
  } catch (err) {
    console.log("error", err);
  }
};

module.exports = {
  generateCode,
  confirmCode,
  getCodes,
};
