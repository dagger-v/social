const { body, validationResult } = require("express-validator");

var express = require("express");
var router = express.Router();

const Status = require("../models/Status");

const asyncHandler = require("express-async-handler");
const async = require("async");

// Display list of all articles.
router.get("/", function (req, res, next) {
  Article.find({}, "content createdAt")
    .sort({ title: 1 })
    .exec(function (err, list_status) {
      if (err) {
        return next(err);
      }
      res.render("index", { status_list: list_status });
    });
});

// Handle article create on POST.
exports.article_create_post = [
  // Validate and sanitize fields.
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("content", "Content must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author").trim().escape(),
  body("category").trim().escape(),
  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create an article object with escaped and trimmed data.
    const article = new Article({
      title: req.body.title,
      content: req.body.content,
      author: req.body.author,
      category: req.body.category,
    });

    if (!errors.isEmpty()) {
      // Get all authors and genres for form.
      async.parallel((err, results) => {
        if (err) {
          return next(err);
        }
        res.render("article_form", {
          title: "Create Article",
          author: author.username,
          content: content,
          category: category,
          article,
          errors: errors.array(),
        });
      });
      return;
    }

    // Data from form is valid. Save article.
    article.save((err) => {
      if (err) {
        return next(err);
      }
      // Successful: redirect to new article record.
      res.redirect(article.url);
    });
  },
];

module.exports = router;
