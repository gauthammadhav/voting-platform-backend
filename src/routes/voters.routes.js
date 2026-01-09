const express = require("express");
const router = express.Router();

const { getVoters } = require("../controllers/voters.controllers");
const authenticate = require("../middleware/auth.middleware");

// Debug route
router.get("/test", (req, res) => {
  console.log("Test voters route hit!");
  res.json({ message: "Voters route is working" });
});

/**
 * GET voters for a candidate
 * Protected route
 */
router.get("/:candidateId", authenticate, (req, res, next) => {
  console.log("Voters route hit with candidateId:", req.params.candidateId);
  getVoters(req, res, next);
});

module.exports = router;
