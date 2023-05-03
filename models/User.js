const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

// Create User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// hash password
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
