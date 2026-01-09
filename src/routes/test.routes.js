const express = require("express");
// Use the configured passport instance (includes JWT strategy)
const passport = require("../config/passport");

const router = express.Router();

/**
 * STEP 8 — Protected route
 * Requires a valid JWT
 */
router.get(
  "/protected",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      message: "Protected route accessed successfully",
      user: req.user,
    });
  }
);

module.exports = router;
