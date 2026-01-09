const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * Cast a vote for a candidate
 * @param {string} userId
 * @param {string} candidateId
 */
async function castVote({ userId, candidateId }) {
  return await prisma.$transaction(async (tx) => {
    // 1️⃣ Fetch user inside transaction
    const user = await tx.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    // 2️⃣ Check if user already voted
    if (user.hasVoted) {
      throw new Error("USER_ALREADY_VOTED");
    }

    // 3️⃣ Verify candidate exists
    const candidate = await tx.candidate.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      throw new Error("CANDIDATE_NOT_FOUND");
    }

    // 4️⃣ Create vote record
    const vote = await tx.vote.create({
      data: {
        userId,
        candidateId,
      },
    });

    // 5️⃣ Update user voting status
    await tx.user.update({
      where: { id: userId },
      data: { hasVoted: true },
    });

    // 6️⃣ Return meaningful result
    return {
      voteId: vote.id,
      candidateId,
    };
  });
}

module.exports = {
  castVote,
};
