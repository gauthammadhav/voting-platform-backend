const voteService = require("./vote.service");

/**
 * POST /api/vote
 * User must be authenticated (JWT)
 */
async function vote(req, res) {
  try {
    const userId = req.user.id;
    const { candidateId } = req.body;

    if (!candidateId) {
      return res.status(400).json({ message: "Candidate ID is required" });
    }

    const result = await voteService.castVote({ userId, candidateId });
    return res.status(201).json({
      message: "Vote cast successfully",
      data: result,
    });
  } catch (error) {
    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({ message: "User not found" });
    }
    if (error.message === "USER_ALREADY_VOTED") {
      return res.status(400).json({ message: "You have already voted" });
    }
    if (error.message === "CANDIDATE_NOT_FOUND") {
      return res.status(404).json({ message: "Candidate not found" });
    }
    console.error("Vote error:", error);
    return res.status(500).json({ message: "Failed to cast vote" });
  }
}

module.exports = {
  vote,
};
