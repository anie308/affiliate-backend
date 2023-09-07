const {
  createUser,
  getUser,
  loginUser,
  getReferrals,
  getUsers,
  updateUser,
  dashStats,
  getTopEarners
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
router.get("/:userId",  getUser);
router.get("/stats/:userId",  dashStats);
router.put("/:userId", verifyToken,  updateUser);

router.post("/signin", validateFields(["email", "password"]), loginUser);

router.get("/referrals/:userId", verifyToken, getReferrals);

router.get("/earners/all",  getTopEarners);

router.get("/users", verifyTokenAndAuthorization, getUsers);

module.exports = router;
