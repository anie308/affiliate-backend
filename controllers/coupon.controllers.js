const Coupon = require("../models/coupon.model");
const { v4: uuidv4 } = require("uuid");
const generateCode = async (req, res) => {
  const { numberOfCodes, username } = req.body;
  try {
    const codes = [];

    for (let i = 0; i < numberOfCodes; i++) {
      const code = uuidv4().substr(0, 8);
      const newCoupon = new Coupon({
        code,
        used: false, 
        generatedFor: username// Set the initial status for each code
      });
      await newCoupon.save();
      codes.push({
        code,
        used: false,
        generatedFor: username// Set the initial status for each code

      });
    }

    res.status(200).json({
      codes,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

const getCodes = async (req,res) => {
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
    console.log("code has ben confirmed");
  } catch (err) {
    console.log("error", err);
  }
};

module.exports = {
  generateCode,
  confirmCode,
  getCodes,
};
