var express = require("express");
var router = express.Router();

const Status = require("../models/Status");

// Display list of all status.
router.get("/", function (req, res, next) {
  Status.find({}, "content createdAt")
    .sort({ title: 1 })
    .exec(function (err, list_status) {
      if (err) {
        return next(err);
      }
      res.render("index", { status_list: list_status });
    });
});

module.exports = router;
