const {
  createUser,
  getUser,
  loginUser,
  getReferrals,
  getUsers,
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

router.post("/signin", validateFields(["email", "password"]), loginUser);

router.get("/referrals/:userId", verifyToken, getReferrals);

router.get("/users", verifyTokenAndAuthorization, getUsers);

module.exports = router;
