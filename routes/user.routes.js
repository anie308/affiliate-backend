const { createUser, getUser, loginUser } = require("../controllers/user.controllers");
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

router.post("/signin", 
// loginValidator,
 loginUser);




module.exports = router;
