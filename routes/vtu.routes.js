const { createVtu } = require("../controllers/vtu.controller");
const { verifyToken } = require("../middlewares/verifyPerson");

const router = require("express").Router();

router.post('/create', verifyToken, createVtu)
module.exports = router;
