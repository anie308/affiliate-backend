const cryptoJs = require("crypto-js");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Coupon = require("../models/coupon.model");
const Code = require("../models/resetCodes.model");
const Withdrawal = require("../models/withdrawalRequest.model");
const brevo = require("@getbrevo/brevo");
const client = brevo.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.SIB_KEY;
const { v4: uuidv4 } = require("uuid");

const tranEmailApi = new brevo.TransactionalEmailsApi();

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

    const referralCode = username+uuidv4().substr(0, 4);
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
        referredByUser.topBalance += 3000;
        referredByUser.refCount += 1;
        await referredByUser.save();
      }
      const indirectRef = referredByUser.referredBy;
      const topChain = await User.findOne(indirectRef);
      if (indirectRef && topChain) {
        topChain.affiliatebalance += 300;
        topChain.topBalance += 300;
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
    if (updateData.phonenumber) {
      user.phonenumber = updateData.phonenumber;
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

    await user.save();

    res.status(200).json({
      message: "User updated successfully",
      statusCode: 200,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if(!user) return res.status(404).json({message:" User Doesnt Exist"})
  const code = uuidv4().substr(0, 6);

  const sender = {
    email: process.env.EMAIL,
  };

  const receiver = [
    {
      email: email,
    },
  ];

  const newCode = new Code({
    code
  })

  tranEmailApi
  .sendTransacEmail({
    sender,
    to: receiver,
    subject: "Forgot Password",
    htmlContent: `<div>Hi ${user.fullname} use this code to reset your password <b>${code}</b>. If you did not initiate this ignore this mail </div>`,
  }).then(()=> {
     newCode.save();
     res.status(200).json({
      statusCode: 200,
      message: 'OTP has been sent to your email'
    })
  })
  .catch((err) => {
    res.status(500).json(err);
  });
}

const resetPassword = async (req, res) => {
  const { email, code, password } = req.body;
  const usercode = Code.findOne({code});
  if(!usercode) return res.status(404).json({message: 'Invalid code'})
  const user = await User.findOne({email});
  if(!user) return res.status(404).json({message: 'User not found'})

  user.password = cryptoJs.AES.encrypt(password, process.env.PASS_SEC)
  await user.save();

  res.status(200).json({
    statusCode: 200,
    message: 'Password reset successful'
  })

}


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

const getTopEarners = async (req, res) => {
  try {
    const users = await User.find()
      .select("id username  fullname  topBalance")
      .sort({ topBalance: -1 }).limit(10);; // Sort by affiliatebalance in descending order

    res.status(200).json({
      statusCode: 200,
      users,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

const calculateTopEarner = async (req, res) => {
  try {
    // Assuming you have a database model named 'User' that represents your users
    const users = await User.find({}).exec();

    const result = [];

    for (const user of users) {
      // Assuming 'refCount' and 'indirectRefCount' are fields representing counts
      const refCount = user.refCount;
      const indirectRefCount = user.indirectRefCount;

      const multipliedRefCount = refCount * 3000;
      const multipliedIndirectRefCount = indirectRefCount * 300;

      // Calculate the total earnings for this user
      const totalEarnings = multipliedRefCount + multipliedIndirectRefCount;

      // Update the user's 'topBalance' field with the total earnings
      user.topBalance = totalEarnings;

      // Save the updated user back to the database
      await user.save();

      // Push the user and their total earnings to the result array
      result.push({ username: user.username, totalEarnings });
    }

    // Sort the users by totalEarnings in descending order
    result.sort((a, b) => b.totalEarnings - a.totalEarnings);

    // Limit the result to the top 10 earners
    const top10Earners = result.slice(0, 10);

    res.status(200).json(top10Earners);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while calculating top earners.' });
  }
};




module.exports = {
  createUser,
  loginUser,
  getUser,
  getUsers,
  getReferrals,
  updateUser,
  dashStats,
  getTopEarners,
  calculateTopEarner,
  forgotPassword,
  resetPassword
};
