const mongoose = require("mongoose");

// Create Status Schema
const statusSchema = new mongoose.Schema({
  author: {
    type: String,
    ref: "User", // Reference to the user who made the status update
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Status", statusSchema);
