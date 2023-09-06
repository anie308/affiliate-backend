const router = require("express").Router();
const {
    verifyToken,
    verifyTokenAndAuthorization,
  } = require("../middlewares/verifyPerson");

const { withdrawFunds, updateWithdrawalStatus, getAllWithdrawals, getUserWithdrawals } = require('../controllers/withdrawal.controller')


router.post(
    "/new",
    verifyToken,
    withdrawFunds
  );

  router.get('/', verifyTokenAndAuthorization, getAllWithdrawals)
  router.get('/:userId', verifyToken, getUserWithdrawals)


router.post(
    "/update/:withdrawalId",
    verifyTokenAndAuthorization,
    updateWithdrawalStatus
  );


module.exports = router;
