var express = require("express");
var router = express.Router();

const User = require("../models/User");
const Status = require("../models/Status");
const FriendRequest = require("../models/FriendRequest");

const passport = require("passport");

const { body, validationResult } = require("express-validator");

const async = require("async");

// create passport local strategy
passport.use(User.createStrategy());

// Serialize and deserialize user
passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, { id: user.id, username: user.username });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

/* GET users listing. */

router.get("/register", (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/");
  } else {
    res.render("register");
  }
});

router.get("/login", (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/");
  } else {
    res.render("login");
  }
});

// Register user in DB
router.post("/register", async (req, res) => {
  try {
    // Register user
    const registerUser = await User.register(
      { username: req.body.username },
      req.body.password
    );
    if (registerUser) {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/");
      });
    } else {
      res.redirect("/register");
    }
  } catch (err) {
    res.send(err);
  }
});

// Login user
router.post("/login", (req, res) => {
  // Create new user object
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  // Using passport will check credentials
  req.login(user, (err) => {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/");
      });
    }
  });
});

// Logout user
router.get("/logout", (req, res) => {
  // Use passport logout method
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

router.get("/:user", async function (req, res, next) {
  const user = req.user.username;
  const id = req.params.user;
  const getId = req.user.id;
  try {
    const allUsers = await User.find({}, "username"); // Retrieve only the _id field for each user
    const allIds = await User.find({}, "_id"); // Retrieve only the _id field for each user
    const userNames = allUsers.map((user) => user._id);
    const userIds = allIds.map((user) => user._id);
    console.log(userNames, userIds);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving user IDs" });
  }
  Status.find({}, "content author createdAt")
    .sort({ title: 1 })
    .exec(function (err, list_status) {
      if (err) {
        return next(err);
      }
      res.render("profile", {
        status_list: list_status,
        user: user,
        id: id,
        getId: getId,
      });
    });
  console.log(user);
  console.log(id);
  console.log(getId);
});

router.post("/:user", [
  // Validate and sanitize fields.
  body("content", "Content must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create an article object with escaped and trimmed data.
    const status = new Status({
      content: req.body.content,
      author: req.body.author,
    });

    if (!errors.isEmpty()) {
      // Get all authors and genres for form.
      async.parallel((err, results) => {
        if (err) {
          return next(err);
        }
        res.render("profile", {
          content: content,
          author: author,
          status,
          errors: errors.array(),
        });
      });
      return;
    }

    // Data from form is valid. Save article.
    status.save((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  },
]);

router.get("/users/:userId", (req, res) => {
  const userId = user.id;
  const userName = req.user.username;

  // Fetch user details from the database
  // Replace this with your logic to fetch the user details
  const user = {
    _id: userId,
    name: userName,
    // Add other user details as needed
  };

  // Check for pending friend requests
  FriendRequest.find({ receiver: userId, status: "pending" })
    .populate("sender") // Populate the sender field to get the sender details
    .exec()
    .then((friendRequests) => {
      // Pass the user and friend request data to the user profile view
      res.render("userProfile", { user, friendRequests });
    })
    .catch((error) => {
      // Handle the error appropriately
      res.status(500).send("Error fetching friend requests");
    });
  console.log(userId);
});

module.exports = router;
