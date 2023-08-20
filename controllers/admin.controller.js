const User = require("../models/user.model");

const assignVendor = async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user's role to "vendor"
    user.role = "vendor";
    await user.save();

    res.status(200).json({
      message: "User role assigned as vendor",
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

const getUsers = async (req, res) => {
  try {
    const populateOptions = [
      { path: "referredBy", select: "_id" }, // Select only the _id field of the referredBy user
      "bankDetails",
    ];
    const users = await User.find({}).populate(populateOptions).sort({
      createdAt: -1,
    });

    const userCount = await User.countDocuments();
    res.status(200).json({
      users,
      userCount,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = {
  assignVendor,
  getUsers,
};
