const Coupon = require("../models/coupon.model");
const User = require("../models/user.model");
const { v4: uuidv4 } = require("uuid");

const generateCode = async (req, res) => {
  const { numberOfCodes, username } = req.body;
  try {
    const user = await User.findOne({ username });

    if (!user) {
      res.status(403).json({
        message: "User not Found",
      });
    } else if (user.role2 !== "superuser") {
      res.status(403).json({
        message: "User is not a vendor",
      });
    } else {
      const codes = [];
      const userId = user._id;

      for (let i = 0; i < numberOfCodes; i++) {
        const code = uuidv4().substr(0, 8);
        const newCoupon = new Coupon({
          code,
          used: false,
          generatedFor: userId, // Set the initial status for each code
        });
        await newCoupon.save();
        codes.push({
          code,
          used: false,
          generatedFor: username, // Set the initial status for each code
        });
      }

      res.status(200).json({
        message: "Codes Generated Successfully",
        statusCode: 200,
        codes,
      });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const getCodes = async (req, res) => {
  const { vendorId } = req.params;
  try {
    const personalisedCodes = await Coupon.find({
      generatedFor: vendorId,
    }).sort({
      createdAt: -1,
    });
    const codeCount = await Coupon.find({
      generatedFor: vendorId,
    })
      .sort({
        createdAt: -1,
      })
      .countDocuments();

    const usedCodes = await Coupon.find({
      generatedFor: vendorId,
      used: true,
    })
      .sort({
        createdAt: -1,
      })
      .countDocuments();
    const unusedCodes = await Coupon.find({
      generatedFor: vendorId,
      used: false,
    })
      .sort({
        createdAt: -1,
      })
      .countDocuments();

    res.status(200).json({
      statusCode: 200,
      personalisedCodes,
      codeCount,
      usedCodes,
      unusedCodes,
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
