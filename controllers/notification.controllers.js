const Notification = require("../models/notification.model");

const createNotification = async (req, res) => {
  const { title, desc, category } = req.body;

  try {
    const newNotification = new Notification({ title, desc, category });
    await newNotification.save();
    res.status(201).json({
      message: "Notification created successfully",
      newNotification,
      
    })
  } catch (err) {
    res.status(500).json(err);
  }
};


module.exports = {
  createNotification
};
