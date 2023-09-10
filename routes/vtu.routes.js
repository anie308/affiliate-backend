const { createVtu, getVtu, updateVtuStatus, openPortal, closePortal } = require("../controllers/vtu.controller");
const { verifyToken, verifyTokenAndAuthorization } = require("../middlewares/verifyPerson");

const router = require("express").Router();

router.post('/create', verifyToken, createVtu)
router.get('/', verifyTokenAndAuthorization, getVtu);
router.post('/portal', verifyTokenAndAuthorization, openPortal);
router.post('/portal/close', verifyTokenAndAuthorization, closePortal);
router.post('/update/:vtuId', verifyTokenAndAuthorization, updateVtuStatus);
module.exports = router;
