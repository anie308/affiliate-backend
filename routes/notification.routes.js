const {
  createNotification,
  getNotifications,
  deleteNotification,
  getNotification,
  updateNotification,
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

router.delete('/:notificationId', verifyTokenAndAuthorization, deleteNotification)


router.get("/", getNotifications);
router.get("/:notificationId", verifyTokenAndAuthorization, getNotification);
router.put("/:notificationId", verifyTokenAndAuthorization, updateNotification);

module.exports = router;
