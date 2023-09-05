const { isValidObjectId } = require("mongoose");
const Notification = require("../models/notification.model");

const createNotification = async (req, res) => {
  const { title, desc, category } = req.body;

  try {
    const newNotification = new Notification({ title, desc, category });
    await newNotification.save();
    res.status(201).json({
      statusCode: 200,
      message: "Notification created successfully",
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

const updateNotification = async (req, res) => {
  const { notificationId } = req.params; // Assuming the trend ID is passed in the URL params
  const { title, desc, category } = req.body;

  try {
    const existingNotification = await Notification.findById(notificationId);

    if (!existingNotification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    if (title) {
      existingNotification.title = title;
    }
    if (desc) {
      existingNotification.desc = desc;
    }
    if (category) {
      existingNotification.category = category;
    }

    await existingNotification.save();

    res.status(200).json({
      message: "Notification updated successfully",
      statusCode: 200,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

const deleteNotification = async (req, res) => {
  const { notificationId } = req.params;
  try {
    await Notification.findByIdAndDelete(notificationId);
    res.status(200).json({
      message: "Notification deleted successfully",
      statusCode: 200,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json(err);
  }
};

const getNotification = async (req, res) => {
  const { notificationId } = req.params;
  try {
    if (!isValidObjectId(notificationId)) {
      return res.status(400).json({ error: "Invalid notificationId" });
    }
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.status(200).json({
      statusCode: 200,
      notification,
    });
  } catch (err) {
    console.error(err); // Log the error for debugging purposes
    res.status(500).json({ error: "Internal server error" });
  }
};


module.exports = {
  createNotification,
  getNotifications,
  deleteNotification,
  getNotification,
  updateNotification
  
};
