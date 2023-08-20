const router = require("express").Router();
const {
    verifyToken,
    verifyTokenAndAuthorization,
  } = require("../middlewares/verifyPerson");

const { withdrawFunds, updateWithdrawalStatus } = require('../controllers/withdrawal.controller')


router.post(
    "/new/:userId",
    // loginValidator,
    withdrawFunds
  );

router.post(
    "/update/:withdrawalId",
    // loginValidator,
    updateWithdrawalStatus
  );


module.exports = router;
