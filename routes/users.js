var express = require("express");
const multer = require("multer");
var router = express.Router();

const User = require("../models/User");
const Status = require("../models/Status");

const { body, validationResult } = require("express-validator");

const async = require("async");

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

router.get("/:user", async function (req, res, next) {
  const user = req.user.username;
  const id = req.user.id;
  const firstname = req.user.firstname;
  const lastname = req.user.lastname;
  const path = req.params.user;
  const receiverUsername = req.params.user;
  const receiverUser = await User.findOne({ username: receiverUsername });
  const receiverUserId = receiverUser._id;
  Status.find({}, "content author createdAt")
    .sort({ createdAt: -1 })
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
        firstname: firstname,
        lastname: lastname,
      });
    });
  console.log(user);
  console.log(firstname);
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
