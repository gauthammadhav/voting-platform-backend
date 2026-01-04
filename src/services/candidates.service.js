const prisma = require("../config/prisma");

async function getAllCandidates() {
  return prisma.candidate.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      linkedinUrl: true,
    },
  });
}

module.exports = {
  getAllCandidates,
};
