const mongoose = require("mongoose");

// Create User Schema
const statusSchema = new mongoose.Schema({
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// hash password
statusSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", statusSchema);
