const router = require("express").Router();

const { assignVendor, getVendors, removeVendor } = require("../controllers/vendor.controller");
const { validateFields } = require("../middlewares/validateFields");
const { verifyTokenAndAuthorization } = require("../middlewares/verifyPerson");

router.post(
    "/assign",
    validateFields(["username"]),
    verifyTokenAndAuthorization,
    assignVendor
  );
router.post(
    "/remove",
    validateFields(["username"]),
    verifyTokenAndAuthorization,
    removeVendor
  );

  router.get(
    "/:username",
    verifyTokenAndAuthorization,
    getVendors
  );

module.exports = router;
