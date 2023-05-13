const mongoose = require("mongoose");

// Create Status Schema
const statusSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Status", statusSchema);
