const candidateService = require("../services/candidates.service");

async function getCandidates(req, res) {
  try {
    const candidates = await candidateService.getAllCandidates();
    res.status(200).json({
      message: "Candidates fetched successfully",
      data: candidates,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch candidates" });
  }
}

module.exports = {
  getCandidates,
};
