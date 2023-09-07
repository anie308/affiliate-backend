const User = require("../models/user.model");

const assignVendor = async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role2 === "superuser") {
      return res.status(404).json({ message: "User is already a vendor" });
    }
    // Update user's role to "vendor"
    user.role2 = "superuser";
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

    if (user.role2 !== "superuser") {
      return res.status(404).json({ message: "User is not a vendor" });
    }
    // Update user's role to "vendor"
    user.role2 = "";
    await user.save();

    res.status(200).json({
      message: "Vendor role has been removed from user",
      statusCode: 200,
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        role: user.role2,
      },
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

const getVendors = async (req, res) => {
  try {
    const vendors = await User.find({ role2: "superuser" }).select(
      "id username email phonenumber bankname fullname profileImage"
    );
    shuffleArray(vendors);
    res.status(200).json({
      statusCode: 200,
      vendors,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = {
  assignVendor,
  getVendors,
  removeVendor,
};

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
