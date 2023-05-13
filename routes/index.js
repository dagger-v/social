var express = require("express");
var router = express.Router();

const Status = require("../models/Status");

const { body, validationResult } = require("express-validator");

const async = require("async");

router.get("/", (req, res) => {
  Status.find({}, "content author createdAt")
    .sort({ createdAt: -1 })
    .limit(1)
    .exec(function (err, recent_status) {
      if (err) {
        return next(err);
      }
      res.render("index", { author: req.user, recent_status: recent_status });
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

    // Data from form is valid. Save article.
    status.save((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  },
]);

module.exports = router;
