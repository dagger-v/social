var express = require("express");
const multer = require("multer");
var router = express.Router();

const User = require("../models/User");
const Status = require("../models/Status");

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

//Configuration for Multer
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images/uploads");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    const user = req.user.username;
    cb(null, `${file.fieldname}-${user}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[1] === "png") {
    cb(null, true);
  } else {
    cb(new Error("Not a .PNG File!!"), false);
  }
};

//Calling the "multer" Function
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
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
  const id = req.user.id;
  const path = req.params.user;
  const receiverUsername = req.params.user;
  const receiverUser = await User.findOne({ username: receiverUsername });
  const receiverUserId = receiverUser._id;
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
        path: path,
        receiverUserId: receiverUserId,
      });
    });
  console.log(user);
  console.log(path);
  console.log(`my ID ${id}`);
  console.log(receiverUserId);
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

router.get("/:user/profile-picture", (req, res) => {
  const user = req.user.username;
  const id = req.user.id;
  const picture = req.user.profilePicture;
  User.findOne({ username: user }, "profilePicture").exec(function (
    err,
    profilePicture
  ) {
    if (err) {
      return next(err);
    }
    res.render("picture", { user, id, picture, profilePicture });
  });
  console.log(user);
  console.log(id);
  console.log(picture);
});

router.post(
  "/:user/profile-picture",
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const path = req.file.path; // Get the path of the uploaded file
      console.log(`userID: ${userId}`);
      console.log(`path: ${path}`);

      const user = await User.findById(userId);
      user.profilePicture = path; // Store the path in the User schema
      await user.save();

      res
        .status(200)
        .json({ message: "Profile picture uploaded successfully" });
    } catch (error) {
      res.status(500).json({
        error: "An error occurred while uploading the profile picture",
      });
    }
  }
);

module.exports = router;
