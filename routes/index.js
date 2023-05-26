var express = require("express");
var router = express.Router();

const Status = require("../models/Status");
const FriendRequest = require("../models/FriendRequest");

const { body, validationResult } = require("express-validator");

const async = require("async");

router.get("/", function (req, res, next) {
  Status.find({}, "content author createdAt")
    .sort({ createdAt: -1 })
    .exec(function (err, list_status) {
      if (err) {
        return next(err);
      }
      res.render("index", { status_list: list_status });
    });
});

router.post("/", [
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
      res.redirect("/");
    });
  },
]);

router.get("/friend-requests", async (req, res) => {
  try {
    const friendRequests = await FriendRequest.find({})
      .populate("sender")
      .populate("receiver");

    res.render("userProfile", { friendRequests });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// POST route to handle the friend request submission
router.post("/friend-requests", (req, res) => {
  const { sender, receiver } = req.body;

  // Create a new FriendRequest instance
  const newRequest = new FriendRequest({
    sender,
    receiver,
  });

  // Save the friend request to the database
  newRequest
    .save()
    .then(() => {
      // Redirect to a success page or send a response indicating success
      res.status(204).send();
    })
    .catch((error) => {
      // Handle the error appropriately
      res.status(500).send("Error sending friend request");
    });
  console.log(sender);
  console.log(receiver);
});

router.get("/requests", async (req, res) => {
  const user = req.user;
  const id = req.user.id;

  const requests = await FriendRequest.find({
    toUser: user._id,
    status: "pending",
  })
    .populate("sender")
    .populate("receiver");

  res.render("requests", { requests, id });
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

module.exports = router;
