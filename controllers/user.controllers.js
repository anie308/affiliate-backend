const cryptoJs = require("crypto-js");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Coupon = require("../models/coupon.model");
const Withdrawal = require("../models/withdrawalRequest.model");

const { v4: uuidv4 } = require("uuid");

const createUser = async (req, res) => {
  const { fullname, email, password, couponcode, username, phonenumber, ref } =
    req.body;

  try {
    const isAlreadyExists = await User.findOne({ email });
    const usernameInUse = await User.findOne({ username });
    const couponStatus = await Coupon.findOne({ code: couponcode });

    if (isAlreadyExists)
      return res.status(400).json({ error: "User already Exists" });
    if (usernameInUse)
      return res.status(400).json({ error: "Username already in use" });
    if (couponStatus.used === true)
      return res
        .status(400)
        .json({ error: "Coupon code has already been used" });

    const referralCode = username+uuidv4().substr(0, 3);
    const referralLink = `https://lidenty.com/signup?ref=${referralCode}`;
    const newUser = new User({
      fullname,
      username,
      couponcode,
      phonenumber,
      email,
      referralCode,
      password: cryptoJs.AES.encrypt(password, process.env.PASS_SEC),
    });

    if (ref) {
      const referredByUser = await User.findOne({ referralCode: ref });
      if (referredByUser) {
        newUser.referredBy = referredByUser._id;
        referredByUser.affiliatebalance += 3000;
        referredByUser.refCount += 1;
        await referredByUser.save();
      }
      const indirectRef = referredByUser.referredBy;
      const topChain = await User.findOne(indirectRef);
      if (indirectRef && topChain) {
        topChain.affiliatebalance += 300;
        topChain.indirectRefCount += 1;
        await topChain.save();
      }
    }

    if (couponStatus) {
      const coupon = await Coupon.findOne({ code: couponcode });
      if (coupon) {
        coupon.used = true;
        coupon.usedBy = newUser._id;
        await coupon.save();
      }
    }

    newUser.activitybalance += 3000;

    await newUser.save();

    res.status(201).json({
      message: "Registration successful",
      statusCode: 201,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};
const updateUser = async (req, res) => {
  const { userId } = req.params; 
  const updateData = req.body;
  const { file } = req;


  try {
    // Check if the user exists
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user data based on the fields provided in the request body
    if (updateData.fullname) {
      user.fullname = updateData.fullname;
    }
    if (updateData.accountnumber) {
      user.accountnumber = updateData.accountnumber;
    }
    if (updateData.accountname) {
      user.accountname = updateData.accountname;
    }
    if (updateData.bankname) {
      user.bankname = updateData.bankname;
    }

    // if (file) {
    //   console.log(file);
    //   const { secure_url: url, public_id } = await cloudinary.uploader.upload(
    //     file.path
    //   );
    //   user.profileImage = { url, public_id };
    //   // newLesson.lessons.lesson_video = { url, public_id };
    // }

    // You can add additional fields to update here if needed

    // Save the updated user data
    await user.save();

    res.status(200).json({
      message: "User updated successfully",
      statusCode: 200,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const isExistingUser = await User.findOne({ email });

    if (!isExistingUser) {
      return res.status(401).json("Wrong Credentials!");
    }

    const hashedGuy = cryptoJs.AES.decrypt(
      isExistingUser.password,
      process.env.PASS_SEC
    );
    const decryptedPassword = hashedGuy.toString(cryptoJs.enc.Utf8);

    if (decryptedPassword !== password) {
      return res.status(401).json("Wrong Credentials!");
    } else {
      if (!isExistingUser.lastLogin) {
        isExistingUser.lastLogin = new Date();
        await isExistingUser.save();
      }
      // Calculate time difference since last login
      const now = new Date();
      const lastLogin = isExistingUser.lastLogin; // Assuming you have this field in your schema
      const timeDifferenceInHours = Math.abs(now - lastLogin) / 36e5;

      // If 24 hours have passed since the last login, add 300 to activitybalance
      if (timeDifferenceInHours >= 24) {
        isExistingUser.activitybalance += 300;
        isExistingUser.lastLogin = now;
        await isExistingUser.save();
      }

      const accessToken = jwt.sign(
        {
          id: isExistingUser._id,
          role: isExistingUser.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      const { password, ...others } = isExistingUser._doc;

      res.status(200).json({
        statusCode: 200,
        status: "success",
        message: "Logged in successfully!",
        data: { ...others, accessToken },
      });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const getUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const populateOptions = ["referredBy"];
    if (!userId) {
      return res.status(401).json({ error: "Invalid request" });
    }

    // Use async/await with Mongoose queries for better error handling and readability
    const user = await User.findById(userId).populate(populateOptions).exec();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(201).json({
      statusCode: 200,
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const getUsers = async (req, res) => {
  try {
    const populateOptions = [
      { path: "referredBy", select: "_id" }, // Select only the _id field of the referredBy user
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

const getReferrals = async (req, res) => {
  const { userId } = req.params;

  try {
    const referringUser = await User.findById(userId);

    if (!referringUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find users who were referred by the referring user
    const referredUsers = await User.find(
      { referredBy: referringUser._id },
      { _id: 1, fullname: 1, email: 1 }
    );

    res.status(200).json({
      referringUser: {
        _id: referringUser._id,
        fullname: referringUser.fullname,
        // Include other user information if needed
      },
      referredUsers,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

const dashStats = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const referredUsers = await User.find({ referredBy: user._id });
    const directReferrals = referredUsers.length;
    const indirectReferredUsers = user.indirectRefCount;
    const totalReferrals = user.indirectRefCount + user.refCount;
    const totalEarnings = user.affiliatebalance + user.activitybalance;

    // const totalCashout = await Withdrawal.find({
    //   userId : userId,
    //   status: 'approved'
    // })

    const totalCashout = await Withdrawal.aggregate([
      {
        $match: {
          userId: userId,
          status: 'approved'
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    let totalCashedAmount = 0;
    if (totalCashout.length > 0) {
      totalCashedAmount = totalCashout[0].totalAmount;
    }


    res.status(200).json({
      statusCode: 200,
      totalCashedAmount,
      directReferrals,
      indirectReferredUsers,
      totalReferrals,
      totalEarnings
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = {
  createUser,
  loginUser,
  getUser,
  getUsers,
  getReferrals,
  updateUser,
  dashStats
};
