const User = require("../models/user.model");
const Admin = require("../models/admin.model");
const cryptoJs = require("crypto-js");
const jwt = require("jsonwebtoken");

const createAdmin = async (req, res) => {
  const { email, password, username } = req.body;
  try {
    const newAdmin = new Admin({
      username,
      email,
      password: cryptoJs.AES.encrypt(password, process.env.PASS_SEC),
    });

    await newAdmin.save();

    res.status(201).json({
      message: "Registration successful",
      statusCode: 200,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

const loginAdmin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const isExistingUser = await Admin.findOne({ username });

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

const getAdmin = async (req, res) => {
  const admin = await Admin.findOne({});
  res.status(200).json({
    statusCode: 200,
    admin
  });
}

module.exports = {
  createAdmin,
  loginAdmin,
  getAdmin
};
