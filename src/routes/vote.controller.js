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
      return res.status(400).json({ error: "candidateId is required" });
    }

    const result = await voteService.castVote({ userId, candidateId });
    return res.status(200).json(result);
  } catch (error) {
    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({ error: "User not found" });
    }
    if (error.message === "USER_ALREADY_VOTED") {
      return res.status(400).json({ error: "You have already voted" });
    }
    if (error.message === "CANDIDATE_NOT_FOUND") {
      return res.status(404).json({ error: "Candidate not found" });
    }
    console.error("Vote error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  vote,
};
