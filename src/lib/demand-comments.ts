import { prisma } from "@/lib/prisma";
import type { Area } from "@/domain/status-machine";

export type DemandCommentModel = {
  id: string;
  author: string;
  body: string;
  area: Area | string;
  createdAt: string;
};

export async function listDemandComments(
  demandId: string,
): Promise<DemandCommentModel[]> {
  if (!demandId) {
    return [];
  }
  try {
    const rows = await prisma.$queryRaw<
      Array<{
        id: string;
        author: string;
        body: string;
        area: string;
        createdAt: string | Date;
      }>
    >`
      SELECT id, author, body, area, createdAt
      FROM "DemandComment"
      WHERE "demandId" = ${demandId}
      ORDER BY "createdAt" ASC
    `;
    return rows.map((row) => ({
      id: row.id,
      author: row.author,
      body: row.body,
      area: row.area,
      createdAt:
        row.createdAt instanceof Date
          ? row.createdAt.toISOString()
          : String(row.createdAt),
    }));
  } catch {
    return [];
  }
}

export async function insertDemandComment(input: {
  demandId: string;
  author: string;
  body: string;
  area: string;
}) {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await prisma.$executeRaw`
    INSERT INTO "DemandComment" ("id", "demandId", "author", "body", "area", "createdAt")
    VALUES (${id}, ${input.demandId}, ${input.author}, ${input.body}, ${input.area}, ${createdAt})
  `;
}
