const mongoose = require("mongoose");

const trendSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    taskText:{
      type: String,
    },
    
    thumbnail: {
        type: Object,
        url: {
          type: URL,
        },
        public_id: {
          type: String,
        },
      },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trend", trendSchema);
