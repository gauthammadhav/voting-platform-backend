const express = require("express");
const passport = require("./config/passport");

const app = express();

// Middleware to parse JSON
app.use(express.json());

// 🔑 REQUIRED: initialize passport
app.use(passport.initialize());

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

const candidateRoutes = require("./routes/candidates.routes");
app.use("/api/candidates", candidateRoutes);

const testRoutes = require("./routes/test.routes");
console.log("TEST ROUTES FILE:", require.resolve("./routes/test.routes"));
app.use("/api/test", testRoutes);

const voteRoutes = require("./routes/vote.routes");
app.use("/api/vote", voteRoutes);

const votersRouters = require("./routes/voters.routes");
console.log("votersRouters type:", typeof votersRouters);
console.log("votersRouters keys:", Object.keys(votersRouters));
console.log("votersRouters.stack length:", votersRouters.stack ? votersRouters.stack.length : 'no stack');
if (votersRouters.stack) {
  votersRouters.stack.forEach((layer, i) => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).join(",").toUpperCase();
      console.log(`  ${i}: ${methods} /api/voters${layer.route.path}`);
    } else {
      console.log(`  ${i}: middleware`);
    }
  });
}

// Test direct route registration
app.get("/api/voters-direct-test", (req, res) => {
  res.json({ message: "Direct route works" });
});

app.use("/api/voters", votersRouters);
console.log("✓ Voters routes registered at /api/voters");

try {
  const authRoutes = require("./routes/auth.routes");
  app.use("/auth", authRoutes);
  console.log("✓ Auth routes registered at /auth");

  // List all routes on this router
  authRoutes.stack.forEach((layer) => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).join(",").toUpperCase();
      console.log(`  ${methods} /auth${layer.route.path}`);
    }
  });
} catch (error) {
  console.error("✗ Failed to load auth routes:", error.message);
  console.error(error.stack);
  throw error;
}

module.exports = app;
