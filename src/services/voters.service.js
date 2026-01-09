const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

/**
 * Get voters for a candidate
 * @param {string} candidateId
 */
async function getVotersByCandidate(candidateId) {
  const votes = await prisma.vote.findMany({
    where: {
      candidateId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          linkedinUrl: true,
        },
      },
    },
  });

  // Extract only user info
  return votes.map((vote) => vote.user);
}

module.exports = {
  getVotersByCandidate,
};
