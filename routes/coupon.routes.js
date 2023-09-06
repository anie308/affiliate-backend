const { generateCode, getCodes } = require("../controllers/coupon.controllers");
const {
  verifyToken,
  verifyTokenAndAuthorization,
} = require("../middlewares/verifyPerson");

const router = require("express").Router();

router.post(
  "/generate-coupon",
//   verifyToken,
  verifyTokenAndAuthorization,
  generateCode
);
router.get(
  "/:vendorId",
//   verifyToken,
//   verifyTokenAndAuthorization,
  getCodes
);


module.exports = router;
