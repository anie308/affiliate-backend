const router = require("express").Router();
const multer = require("../middlewares/multer");
const {
  createTrend,
  updateTrend,
  getTrends,
  deleteTrend,
  getTrend,
  completeTrend
} = require("../controllers/trend.controller");
const { verifyTokenAndAuthorization, verifyToken } = require("../middlewares/verifyPerson");
const { validateFields } = require("../middlewares/validateFields");

router.post(
  "/create",
  multer.single("thumbnail"),
  validateFields(["title", "slug", "content", "taskText"]),
  verifyTokenAndAuthorization,
  createTrend
);
router.post(
  "/complete",
  verifyToken,
  completeTrend
);


router.put("/:trendId",  verifyTokenAndAuthorization, updateTrend);
router.get("/:trendId", verifyTokenAndAuthorization, getTrend);
router.get("/", getTrends);
router.delete("/:trendId", verifyTokenAndAuthorization, deleteTrend);

module.exports = router;
