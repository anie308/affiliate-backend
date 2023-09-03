const {
  createNotification,
  getNotifications,
} = require("../controllers/notification.controllers");
const {
  verifyToken,
  verifyTokenAndAuthorization,
} = require("../middlewares/verifyPerson");
const { validateFields } = require("../middlewares/validateFields");

const router = require("express").Router();

router.post(
  "/create",
  validateFields(["title", "desc", "category"]),
  verifyTokenAndAuthorization,
  createNotification
);
router.get("/", verifyToken, getNotifications);

module.exports = router;
