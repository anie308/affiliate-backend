const router = require("express").Router();
const multer = require("../middlewares/multer");
const {
  createTrend,
  updateTrend,
  getTrends,
  deleteTrend,
  getTrend
} = require("../controllers/trend.controller");
const { verifyTokenAndAuthorization } = require("../middlewares/verifyPerson");

router.post(
  "/create",
  multer.single("thumbnail"),
  verifyTokenAndAuthorization,
  createTrend
);
router.put("/:trendId",  verifyTokenAndAuthorization, updateTrend);
router.get("/:trendId", verifyTokenAndAuthorization, getTrend);
router.get("/", getTrends);
router.delete("/:trendId", verifyTokenAndAuthorization, deleteTrend);

module.exports = router;
