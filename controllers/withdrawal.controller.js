const WithdrawRequest = require("../models/withdrawalRequest.model");
const User = require("../models/user.model");

const withdrawFunds = async (req, res) => {
  const { userId } = req.params;
  const { amount, category } = req.body;

  try {
    const user = await User.findById(userId);
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
      return res
        .status(400)
        .json({ message: "Please update your bank details" });
    }

    if (category === "activity") {
      const today = new Date();
      const dayOfMonth = today.getDate();

      if (dayOfMonth !== 20) {
        return res.status(400).json({
          message:
            "Withdrawals are only allowed on the 20th day of the month for the 'activity' category",
        });
      }

      if (amount < 16000) {
        return res.status(400).json({
          message: "Minimum withdrawal amount for 'activity' category is 16000",
        });
      }

      if (activitybalance < amount) {
        return res.status(400).json({ message: "Insufficient funds" });
      } else {
        user.activitybalance -= amount;
      }
    } else if (category === "affiliate") {
      const today = new Date();
      const dayOfWeek = today.getDay();

      if (dayOfWeek !== 1 && dayOfWeek !== 5) {
        // 1 represents Monday, 5 represents Friday
        return res.status(400).json({
          message:
            "Withdrawals are only allowed on Mondays and Fridays of the week for the 'affiliate' category",
        });
      }

      if (amount < 6000) {
        return res.status(400).json({
          message: "Minimum withdrawal amount for 'affiliate' category is 6000",
        });
      }

      if (affiliatebalance < amount) {
        return res.status(400).json({ message: "Insufficient funds" });
      }
      user.affiliatebalance -= amount;
    }

    await user.save();
    const withdrawRequest = new WithdrawRequest({
      userId :id,
      amount,
      category,
      bankname,
      accountnumber,
      accountname,
      fullname,
    });
    await withdrawRequest.save();
    res.status(201).json({
      message: "Withdrawal request sent successfully",
      data: {
        amount: withdrawRequest.amount,
        category: withdrawRequest.category,
        status: withdrawRequest.status, // Assuming status is a field in WithdrawRequest schema
      },
    });
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

    if (status === "success") {
      // If the status is success, no further action needed
      return res.status(200).json({ message: "Withdrawal status updated to success" });
    } else if (status === "failed") {
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

      return res.status(200).json({ message: "Withdrawal status updated to failed, and money refunded to user's balance" });
    }

    res.status(400).json({ message: "Invalid status" });
  } catch (err) {
    res.status(500).json(err);
  }
};



module.exports = {
  withdrawFunds,
  updateWithdrawalStatus,
  getAllWithdrawals
};
