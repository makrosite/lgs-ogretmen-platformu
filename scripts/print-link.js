const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
p.studentLink
  .findFirst({ where: { usedAt: null }, select: { token: true } })
  .then((l) => {
    console.log(l?.token ?? "NONE");
    return p.$disconnect();
  });
