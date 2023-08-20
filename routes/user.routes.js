const {
  createUser,
  getUser,
  loginUser,
  getReferrals,
} = require("../controllers/user.controllers");
const {
  verifyToken,
  verifyTokenAndAuthorization,
} = require("../middlewares/verifyPerson");

const router = require("express").Router();

router.post(
  "/register",
  //   verifyToken,
  //   verifyTokenAndAuthorization,
  createUser
);
router.get(
  "/:userId",
  //   verifyToken,
  //   verifyTokenAndAuthorization,
  getUser
);

router.post(
  "/signin",
  // loginValidator,
  loginUser
);

router.get(
  "/referrals/:userId",
  // loginValidator,
  getReferrals
);



module.exports = router;
