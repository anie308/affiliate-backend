const router = require("express").Router();

const {
  createAdmin,
  loginAdmin,
} = require("../controllers/admin.controller");
const { validateFields } = require("../middlewares/validateFields");

router.post(
  "/register",
  validateFields(["email", "password", "username"]),
  createAdmin
);
router.post("/signin", validateFields(["username", "password"]), loginAdmin);


module.exports = router;
