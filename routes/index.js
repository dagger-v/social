var express = require("express");
var router = express.Router();

const Status = require("../models/Status");
const FriendRequest = require("../models/FriendRequest");

const { body, validationResult } = require("express-validator");

const async = require("async");
const he = require("he");

router.get("/", function (req, res, next) {
  res.render("index");
});

router.get("/home", function (req, res, next) {
  const id = req.user.id;
  const user = req.user.username;
  const firstname = req.user.firstname;
  const lastname = req.user.lastname;
  Status.find({}, "content author createdAt")
    .sort({ createdAt: -1 })
    .exec(function (err, list_status) {
      if (err) {
        return next(err);
      }
      res.render("home", {
        status_list: list_status,
        id,
        user,
        firstname,
        lastname,
      });
    });
});

router.post("/home", [
  // Validate and sanitize fields.
  body("content", "Content must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Access the text content from the form
    const text = req.body.content;

    // Decode the text content using he library
    const decodedText = he.decode(text);

    // Create an article object with escaped and trimmed data.
    const status = new Status({
      content: decodedText,
      author: req.body.author,
    });

    if (!errors.isEmpty()) {
      // Get all authors and genres for form.
      async.parallel((err, results) => {
        if (err) {
          return next(err);
        }
        res.render("profile", {
          author: author.username,
          content: content,
          status,
          errors: errors.array(),
        });
      });
      return;
    }

    // Data from form is valid. Save statue update.
    status.save((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/home");
    });
  },
]);

// GET route for friend requests
router.get("/requests", async (req, res) => {
  const toUser = req.user;
  const user = req.user.username;
  const id = req.user.id;
  console.log(user);

  const requests = await FriendRequest.find({
    toUser: toUser._id,
    status: "pending",
  })
    .populate("sender")
    .populate("receiver");

  res.render("requests", { requests, id, toUser, user });
});

// POST route to handle the friend request submission
router.post("/requests", (req, res) => {
  const { receiver } = req.body;

  FriendRequest.create({
    sender: req.user.id,
    receiver,
  })
    .then(() => {
      // Redirect to a success page or send a response indicating success
      res.status(204).send();
    })
    .catch((error) => {
      // Handle the error appropriately
      res.status(500).send("Error sending friend request");
    });
});

router.post("/requests/:id/accept", async (req, res) => {
  const request = await FriendRequest.findById(req.params.id);
  request.status = "accepted";
  await request.save();
  res.redirect("/requests");
});

router.post("/requests/:id/reject", async (req, res) => {
  const request = await FriendRequest.findById(req.params.id);
  request.status = "rejected";
  await request.save();
  res.redirect("/requests");
});

router.get("/:user/friends", async function (req, res) {
  const user = req.user.username;

  const friends = await FriendRequest.find({
    $or: [{ sender: req.user.id }, { receiver: req.user.id }],
    status: "accepted",
  })
    .populate("sender")
    .populate("receiver")
    .exec();

  console.log(`list of friends: ${friends}`);
  res.render("friends", { user, friends });
});

module.exports = router;
