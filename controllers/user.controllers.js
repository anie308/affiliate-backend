const cryptoJs = require("crypto-js");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Coupon = require("../models/coupon.model");
const { v4: uuidv4 } = require("uuid");

const createUser = async (req, res) => {
  const { fullname, email, password, couponcode, username, phonenumber, ref } =
    req.body;

  try {
    const isAlreadyExists = await User.findOne({ email });
    const usernameInUse = await User.findOne({ username });
    const couponStatus = await Coupon.findOne({code:couponcode});

    if (isAlreadyExists)
      return res.status(400).json({ error: "User already Exists" });
    if (usernameInUse)
      return res.status(400).json({ error: "Username already in use" });
    if (couponStatus.used === true)
      return res.status(400).json({ error: "Coupon code has already been used" });

    const referralCode = uuidv4().substr(0, 8);
    const referralLink = `https://yourwebsite.com/signup?ref=${referralCode}`;
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
      status: "success",
      referralLink,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const isExistingUser = await User.findOne({ email });
  !isExistingUser && res.status(401).json("Wrong Credentials!");
  const hashedGuy = cryptoJs.AES.decrypt(
    isExistingUser.password,
    process.env.PASS_SEC
  );
  const decryptedPassword = hashedGuy.toString(cryptoJs.enc.Utf8);

  if (decryptedPassword !== password) {
    res.status(401).json("Wrong Credentials!");
  } else {
    const accessToken = jwt.sign(
      {
        id: isExistingUser._id,
        role: isExistingUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );

    const { password, ...others } = isExistingUser._doc;

    res.status(200).json({
      status: "success",
      message: "Logged in successfully!",
      data: { ...others, accessToken },
    });
  }
};

const getUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const populateOptions = ["referredBy", "bankDetails"];
    if (!userId) {
      return res.status(401).json({ error: "Invalid request" });
    }

    // Use async/await with Mongoose queries for better error handling and readability
    const user = await User.findById(userId).populate(populateOptions).exec();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      user,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createUser,
  loginUser,
  getUser,
};
