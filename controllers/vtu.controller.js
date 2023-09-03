const VTU = require("../models/vtu.model.js");

const createVTU = async (req, res) => {
  const { userId, phonenumber, phoneline, dataplan } = req.body;
  try {
    const newVTU = new VTU({
      userId,
      phonenumber,
      phoneline,
      dataplan,
    });

    await newVTU.save();

    res.status(201).json({
      message: "Request Sent Successfully",
      statusCode: 200,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

const getVTU = async (req, res) => {
  try {
    const VTUs = await VTU.find({}).sort({ createdAt: -1 });
    res.status(200).json(VTUs);
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = {
  createVTU,
  getVTU,
};
