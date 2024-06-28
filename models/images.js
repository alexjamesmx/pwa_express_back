const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  id: { type: String },
  url: { type: String },
});

module.exports = mongoose.model("Image", imageSchema);
