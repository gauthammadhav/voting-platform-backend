const express = require("express");

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

const candidateRoutes = require("./routes/candidates.routes");
app.use("/api/candidates", candidateRoutes);

module.exports = app;
