const User = require("../models/user.model");

const assignVendor = async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "vendor") {
      return res.status(404).json({ message: "User is already a vendor" });
    }
    // Update user's role to "vendor"
    user.role = "vendor";
    await user.save();

    res.status(200).json({
      message: "User role assigned as vendor",
      statusCode: 200,
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

const removeVendor = async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role !== "vendor") {
      return res.status(404).json({ message: "User is not a vendor" });
    }
    // Update user's role to "vendor"
    user.role = "user";
    await user.save();

    res.status(200).json({
      message: "Vendor role has been removed from user",
      statusCode: 200,
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

const getVendors = async (req, res) => {
  try {
    const vendors = await User.find({ role: "vendor" }).select(
      "id username email"
    );
    res.status(200).json(vendors);
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = {
  assignVendor,
  getVendors,
  removeVendor,
};
