const express = require("express");
const passport = require("passport");
const voteController = require("./vote.controller");

const router = express.Router();

/**
 * POST /api/vote
 * User must be authenticated (JWT)
 */
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  voteController.vote
);

module.exports = router;
