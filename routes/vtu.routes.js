const { createVtu, getVtu, updateVtuStatus } = require("../controllers/vtu.controller");
const { verifyToken, verifyTokenAndAuthorization } = require("../middlewares/verifyPerson");

const router = require("express").Router();

router.post('/create', verifyToken, createVtu)
router.get('/', verifyTokenAndAuthorization, getVtu);
router.post('/update/:vtuId', verifyTokenAndAuthorization, updateVtuStatus);
module.exports = router;
