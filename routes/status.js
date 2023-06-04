var express = require("express");
var router = express.Router();

const Status = require("../models/Status");

// PUT request for status updates.
router.put("/status/:statusId/like", async (req, res) => {
  const statusId = req.params.statusId;

  try {
    // Find the status by its ID
    const status = await Status.findById(statusId);

    // Increment the likes count
    status.likes += 1;

    // Save the updated status
    await status.save();

    res.status(200).json(status);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
