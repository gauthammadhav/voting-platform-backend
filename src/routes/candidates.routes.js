const express = require("express");
const router = express.Router();
const { getCandidates } = require("../controllers/candidates.controller");

router.get("/", getCandidates);

module.exports = router;
