const Coupon = require('../models/coupon.model')

const checkCodeValidity = async (req, res, next) => {
    const { code } = req.body;
  
    try {
      const existingCoupon = await Coupon.findOne({ code });
  
      if (!existingCoupon) {
        return res.status(404).json({
          error: "Code not found.", 
        });
      }
  
      if (existingCoupon.status === "Used") {
        return res.status(400).json({
          error: "Code has already been used.",
        });
      }
  
      req.coupon = existingCoupon; // Attach the coupon to the request
      next(); // Move on to the next middleware or route handler
    } catch (err) {
      res.status(500).json({
        error: "An error occurred while checking the code.",
      });
    }
  };
  

  module.exports = { checkCodeValidity };
