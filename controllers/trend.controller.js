const Trend = require("../models/trend.model");
const User = require("../models/user.model");
const cloudinary = require("../cloud");
const { isValidObjectId } = require("mongoose");
const cron = require("node-cron");

const createTrend = async (req, res) => {
  const { title, content, slug, taskText } = req.body;
  const { file } = req;

  const alreadyExists = await Trend.findOne({ slug });

  try {
    if (alreadyExists)
      return res.status(400).json({ message: "Trend already exists!" });
    const newTrend = new Trend({
      title,
      content,
      slug,
      taskText,
    });

    if (file) {
      console.log(file);
      const { secure_url: url, public_id } = await cloudinary.uploader.upload(
        file.path
      );
      newTrend.thumbnail = { url, public_id };
      // newLesson.lessons.lesson_video = { url, public_id };
    }

    await newTrend.save();

    res.status(201).json({
      message: "Trend created successfully",
      statusCode: 201,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

const updateTrend = async (req, res) => {
  const { trendId } = req.params; // Assuming the trend ID is passed in the URL params
  const { title, content, taskText, slug } = req.body;

  try {
    const existingTrend = await Trend.findById(trendId);

    if (!existingTrend) {
      return res.status(404).json({ message: "Trend not found" });
    }

    if (title) {
      existingTrend.title = title;
    }
    if (slug) {
      existingTrend.slug = slug;
    }
    if (content) {
      existingTrend.content = content;
    }
    if (taskText) {
      existingTrend.taskText = taskText;
    }

    await existingTrend.save();

    res.status(200).json({
      message: "Trend updated successfully",
      statusCode: 200,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

const deleteTrend = async (req, res) => {
  const { trendId } = req.params; // Assuming the trend ID is passed in the URL params
  try {
    if (!isValidObjectId(trendId))
      return res.status(401).json({ error: "Invalid request" });

    const existingTrend = await Trend.findById(trendId);

    if (!existingTrend) {
      return res.status(404).json({ message: "Trend not found" });
    }

    const public_id = existingTrend.thumbnail?.public_id;

    if (public_id) {
      const { result } = await cloudinary.uploader.destroy(public_id);
      console.log(result);
      if (result !== "ok")
        return res.status(404).json({ error: "Could not remove thumbnail!" });
    }

    await Trend.findByIdAndDelete(trendId);

    res.status(200).json({
      message: "Trend deleted successfully",
      statusCode: 200,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

const getTrend = async (req, res) => {
  const { trendId } = req.params;

  try {
    if (!isValidObjectId(trendId))
      return res.status(401).json({ error: "Invalid request" });
    const trend = await Trend.findById(trendId);

    res.status(200).json({
      trend,
      statusCode: 200,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

const getTrends = async (req, res) => {
  try {
    const trends = await Trend.find({}).sort({ createdAt: -1 });

    res.status(200).json({
      trends,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

const completeTrend = async (req, res) => {
  const { userId, trendId } = req.body;
  console.log(userId, trendId)

  try {
    const trend = await Trend.findById(trendId);
    const user = await User.findById(userId);
    if (!trend) {
      return res.status(404).json({
        statusCode: 200,
        message: "Trend not found",
      });
    }
    if (!user) {
      return res.status(404).json({
        statusCode: 200,
        message: "User not found",
      });
    }
    if (user.hasDoneTaskForToday) {
      return res.status(400).json({
        statusCode: 400,
        message: "You have already completed a task today",
      });
    }
    user.hasDoneTaskForToday = true;
    user.activitybalance += 200;
    await user.save();
    res.status(200).json({
      statusCode: 200,
      message: "Task completed successfully",
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

cron.schedule("0 0 * * *", async () => {
  try {
    // Update all users to set hasDoneTaskForToday to false
    await User.updateMany({}, { $set: { hasDoneTaskForToday: false } });

    console.log("Daily task reset completed.");
  } catch (err) {
    console.error("Error resetting daily tasks:", err);
  }
});

module.exports = {
  createTrend,
  getTrends,
  deleteTrend,
  updateTrend,
  getTrend,
  completeTrend,
};
