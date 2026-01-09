const { getVotersByCandidate } = require("../services/voters.service");

async function getVoters(req, res) {
  try {
    const { candidateId } = req.params;

    if (!candidateId) {
      return res.status(400).json({ message: "Candidate ID is required" });
    }

    const voters = await getVotersByCandidate(candidateId);

    res.status(200).json({
      message: "Voters fetched successfully",
      data: {
        candidateId,
        voters,
      },
    });
  } catch (error) {
    console.error("Get voters error:", error.message);
    res.status(500).json({ message: "Failed to fetch voters" });
  }
}

module.exports = {
  getVoters,
};
