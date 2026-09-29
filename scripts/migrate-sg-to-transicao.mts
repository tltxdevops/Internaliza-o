import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const before = {
  areaWork: await prisma.areaWork.count({ where: { area: "sg" } }),
  statusEvent: await prisma.statusEvent.count({ where: { area: "sg" } }),
};

const areaWork = await prisma.areaWork.updateMany({
  where: { area: "sg" },
  data: { area: "transicao" },
});
const statusEvent = await prisma.statusEvent.updateMany({
  where: { area: "sg" },
  data: { area: "transicao" },
});

console.log(
  JSON.stringify({
    before,
    updated: { areaWork: areaWork.count, statusEvent: statusEvent.count },
  }),
);

await prisma.$disconnect();
