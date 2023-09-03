const router = require("express").Router();
const {
    verifyToken,
    verifyTokenAndAuthorization,
  } = require("../middlewares/verifyPerson");

const { withdrawFunds, updateWithdrawalStatus, getAllWithdrawals } = require('../controllers/withdrawal.controller')


router.post(
    "/new/:userId",
    verifyToken,
    withdrawFunds
  );

  router.get('/', verifyTokenAndAuthorization, getAllWithdrawals)

router.post(
    "/update/:withdrawalId",
    verifyTokenAndAuthorization,
    updateWithdrawalStatus
  );


module.exports = router;
