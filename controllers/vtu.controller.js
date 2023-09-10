const Vtu = require("../models/vtu.model.js");
const User = require("../models/user.model.js");
const Admin = require("../models/admin.model.js");

const createVtu = async (req, res) => {
  const { userId, amount, phonenumber, network, type, duration, plan, points } =
    req.body;
  try {
    const user = await User.findById(userId);
    const admin = await Admin.findOne({});

    const newVtu = new Vtu({
      userId,
      phonenumber,
      network,
      amount,
      plan,
      duration,
      type,
      points,
    });

    if (admin.vtuPortalOpen === false) {
      return res.status(400).json({
        message: "VTU Portal is currently closed",
        statusCode: 400,
      });
    } else {
      if (
        user.activitybalance < parseFloat(points) ||
        user.activitybalance < parseFloat(amount)
      ) {
        return res.status(400).json({
          message: "Insufficient Balance",
          statusCode: 400,
        });
      }
      if (type === "data") {
        user.activitybalance = user.activitybalance -= points;
      } else if (type === "airtime") {
        if (!amount.trim()) {
          return res.status(400).json({
            message: "Amount is required",
            statusCode: 400,
          });
        }
        user.activitybalance = user.activitybalance -= parseFloat(amount);
      }

      console.log(points);

      await user.save();

      await newVtu.save();
    }

    res.status(201).json({
      message: "Request Sent Successfully",
      statusCode: 200,
    });
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
};

const getVtu = async (req, res) => {
  try {
    const allVtu = await Vtu.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      allVtu,
      statusCode: 200,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

const updateVtuStatus = async (req, res) => {
  const { vtuId } = req.params;
  const { status } = req.body;

  try {
    const vtuRequest = await Vtu.findById(vtuId);
    if (!vtuRequest) {
      return res.status(404).json({ message: "Vtu request not found" });
    }

    // Update withdrawal status
    vtuRequest.status = status;
    await vtuRequest.save();

    if (status === "approved") {
      // If the status is success, no further action needed
      return res.status(200).json({
        statusCode: 200,
        message: "Top Up Success!",
      });
    } else if (status === "declined") {
      // Refund money to the user's balance and update user document
      const user = await User.findById(vtuRequest.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.activitybalance += vtuRequest.amount;

      await user.save();

      return res.status(200).json({
        statusCode: 200,
        message: "Top Up declined!",
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
    admin.vtuPortalOpen = value;
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
    admin.vtuPortalOpen = value;
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
  createVtu,
  getVtu,
  updateVtuStatus,
  openPortal,
  closePortal
};
