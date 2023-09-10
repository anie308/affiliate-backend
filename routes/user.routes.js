const {
  createUser,
  getUser,
  loginUser,
  getReferrals,
  getUsers,
  updateUser,
  dashStats,
  getTopEarners,
  forgotPassword,
  resetPassword
  // calculateTopEarner,
} = require("../controllers/user.controllers");
const {
  verifyToken,
  verifyTokenAndAuthorization,
} = require("../middlewares/verifyPerson");
const { validateFields } = require("../middlewares/validateFields");

const router = require("express").Router();

router.post(
  "/register",
  validateFields([
    "couponcode",
    "email",
    "fullname",
    "password",
    "username",
    "phonenumber",
  ]),
  createUser
);

router.post("/forgotpassword", validateFields(["email"]), forgotPassword);
router.post("/resetpassword", validateFields(["email", "code", "password"]), resetPassword);
router.get("/:userId",  getUser);
router.get("/stats/:userId",  dashStats);
router.put("/:userId", verifyToken,  updateUser);

router.post("/signin", validateFields(["email", "password"]), loginUser);

router.get("/referrals/:userId", verifyToken, getReferrals);

router.get("/earners/all",  getTopEarners);
// router.get("/earners/calc",  calculateTopEarner);

router.get("/users", verifyTokenAndAuthorization, getUsers);

module.exports = router;
