const express = require("express");
const passport = require("../config/passport");
const { generateToken } = require("../config/jwt");

const router = express.Router();

/**
 * STEP 7 — Route 1
 * Starts Google OAuth
 */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/linkedin",
  passport.authenticate("linkedin")
);


console.log("✓ /google route defined");

/**
 * STEP 7 — Route 2
 * Google redirects here after login
 */
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    // At this point, authentication is COMPLETE
    // Passport has attached the user to req.user

    const user = req.user;

    // Create JWT for our application
    const token = generateToken({
      userId: user.id,
      provider: user.provider,
    });

    // Send token to client
    res.status(200).json({
      message: "Google login successful",
      data: { token },
    });
  }
);

router.get(
  "/linkedin/callback",
  passport.authenticate("linkedin", { session: false }),
  (req, res) => {
    const user = req.user;

    const token = generateToken({
      userId: user.id,
      provider: user.provider,
    });

    res.status(200).json({
      message: "LinkedIn login successful",
      data: { token },
    });
  }
);


module.exports = router;
