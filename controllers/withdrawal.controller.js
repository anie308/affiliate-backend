const WithdrawRequest = require("../models/withdrawalRequest.model");
const User = require("../models/user.model");
const Admin = require("../models/admin.model");
const { isValidObjectId } = require("mongoose");

const withdrawFunds = async (req, res) => {
  const { amount, category, userId } = req.body;

  try {
    const user = await User.findById(userId);
    const admin = await Admin.findOne({});
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const {
      id,
      fullname,
      activitybalance,
      affiliatebalance,
      bankname,
      accountnumber,
      accountname,
    } = user;
    if (!bankname || !accountnumber || !accountname) {
      return res.status(400).json({
        statusCode: 200,
        message: "Please update your bank details",
      });
    }

    if (category === "activity") {
      if (admin.withdrawPortal === false) {
        return res.status(400).json({
          message: "Withdrawal Portal is currently closed",
          statusCode: 400,
        });
      } else {
        if (parseInt(amount) < 16000) {
          return res.status(201).json({
            statusCode: 400,
            message:
              "Minimum withdrawal amount for 'activity' category is 16000",
          });
        }

        if (activitybalance < parseInt(amount)) {
          return res.status(201).json({
            statusCode: 400,
            message: "Insufficient funds",
          });
        } else {
          user.activitybalance -= parseInt(amount);
          await user.save();
          const withdrawRequest = new WithdrawRequest({
            userId: id,
            amount,
            category,
            bankname,
            accountnumber,
            accountname,
            fullname,
          });
          await withdrawRequest.save();
          res.status(201).json({
            statusCode: 201,
            message: "Withdrawal request sent successfully",
            data: {
              amount: withdrawRequest.amount,
              category: withdrawRequest.category,
              status: withdrawRequest.status, // Assuming status is a field in WithdrawRequest schema
            },
          });
        }
      }
    } else if (category === "affiliate") {
      if (admin.withdrawPortal === false) {
        return res.status(400).json({
          message: "Withdrawal Portal is currently closed",
          statusCode: 400,
        });
      } else {
        if (amount < 6000) {
          return res.status(201).json({
            statusCode: 400,
            message:
              "Minimum withdrawal amount for 'affiliate' category is 6000",
          });
        }

        if (affiliatebalance < amount) {
          return res.status(201).json({
            statusCode: 400,
            message: "Insufficient funds",
          });
        }
        user.affiliatebalance -= parseInt(amount);
        await user.save();
        const withdrawRequest = new WithdrawRequest({
          userId: id,
          amount,
          category,
          bankname,
          accountnumber,
          accountname,
          fullname,
        });
        await withdrawRequest.save();
        res.status(201).json({
          statusCode: 201,
          message: "Withdrawal request sent successfully",
          data: {
            amount: withdrawRequest.amount,
            category: withdrawRequest.category,
            status: withdrawRequest.status, // Assuming status is a field in WithdrawRequest schema
          },
        });
      }
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const getAllWithdrawals = async (req, res) => {
  try {
    const withdrawals = await WithdrawRequest.find({}).sort({ createdAt: -1 });
    res.status(200).json(withdrawals);
  } catch (err) {
    res.status(500).json(err);
  }
};

const getUserWithdrawals = async (req, res) => {
  const { userId } = req.params;

  try {
    if (!isValidObjectId(userId))
      return res.status(401).json({ error: "Invalid request" });

    const withdrawals = await WithdrawRequest.find({ userId }).sort({
      createdAt: -1,
    });
    res.status(200).json(withdrawals);
  } catch (err) {
    res.status(500).json(err);
  }
};

const updateWithdrawalStatus = async (req, res) => {
  const { withdrawalId } = req.params;
  const { status } = req.body;

  try {
    const withdrawRequest = await WithdrawRequest.findById(withdrawalId);
    if (!withdrawRequest) {
      return res.status(404).json({ message: "Withdrawal request not found" });
    }

    // Update withdrawal status
    withdrawRequest.status = status;
    await withdrawRequest.save();

    if (status === "approved") {
      // If the status is success, no further action needed
      return res.status(200).json({
        statusCode: 200,
        message: "Withdrawal Success!",
      });
    } else if (status === "declined") {
      // Refund money to the user's balance and update user document
      const user = await User.findById(withdrawRequest.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (withdrawRequest.category === "activity") {
        user.activitybalance += withdrawRequest.amount;
      } else if (withdrawRequest.category === "affiliate") {
        user.affiliatebalance += withdrawRequest.amount;
      }

      await user.save();

      return res.status(200).json({
        statusCode: 200,
        message: "Withdrawal declined!",
      });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const openPortal = async (req, res) => {
  const { value} = req.body;
  try {
    const admin = await Admin.findOne({});
    admin.withdrawPortal = value;
    await admin.save();
    res.status(200).json({
      message: "VTU Portal Opened Successfully",
      statusCode: 200,
    });
  } catch (err) {
    res.status(500).json(err);
  }
}
const closePortal = async (req, res) => {
  const { value} = req.body;
  try {
    const admin = await Admin.findOne({});
    admin.withdrawPortal = value;
    await admin.save();
    res.status(200).json({
      message: "VTU Portal Closed Successfully",
      statusCode: 200,
    });
  } catch (err) {
    res.status(500).json(err);
  }
}

module.exports = {
  withdrawFunds,
  updateWithdrawalStatus,
  getAllWithdrawals,
  getUserWithdrawals,
  closePortal,
  openPortal
};
