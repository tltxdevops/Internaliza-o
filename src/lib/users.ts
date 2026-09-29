import { isArea, type Area } from "@/domain/status-machine";
import {
  bootstrapAdminEmail,
  isAllowedEmail,
} from "@/lib/microsoft";
import { prisma } from "@/lib/prisma";
import type { ViewerRole } from "@/lib/viewer";

export type AppUser = {
  email: string;
  name: string;
  role: ViewerRole | "pending";
  area: Area | "";
};

function asRole(value: string): AppUser["role"] {
  if (value === "admin" || value === "member") {
    return value;
  }
  return "pending";
}

export async function findUser(email: string): Promise<AppUser | null> {
  const row = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
  if (!row) {
    return null;
  }
  return {
    email: row.email,
    name: row.name,
    role: asRole(row.role),
    area: isArea(row.area) ? row.area : "",
  };
}

export async function listUsers(): Promise<AppUser[]> {
  const rows = await prisma.user.findMany({ orderBy: { email: "asc" } });
  return rows.map((row) => ({
    email: row.email,
    name: row.name,
    role: asRole(row.role),
    area: isArea(row.area) ? row.area : "",
  }));
}

/** Cria ou atualiza a pessoa depois do Microsoft. Admin inicial vem do .env. */
export async function upsertFromMicrosoft(input: {
  email: string;
  name: string;
  microsoftId: string;
}): Promise<AppUser> {
  const email = input.email.trim().toLowerCase();
  if (!isAllowedEmail(email)) {
    throw new Error("domain");
  }
  const bootstrap = email === bootstrapAdminEmail();
  const existing = await prisma.user.findUnique({ where: { email } });
  const row = await prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: input.name,
      microsoftId: input.microsoftId,
      role: bootstrap ? "admin" : "pending",
      area: "",
    },
    update: {
      name: input.name || existing?.name || "",
      microsoftId: input.microsoftId || existing?.microsoftId || "",
      role: bootstrap ? "admin" : existing?.role ?? "pending",
    },
  });
  return {
    email: row.email,
    name: row.name,
    role: asRole(row.role),
    area: isArea(row.area) ? row.area : "",
  };
}

/** E-mail + área liberam a lista na hora. O e-mail inicial do .env continua admin. */
export async function enterByEmailAndArea(email: string, area: string): Promise<AppUser> {
  const normalized = email.trim().toLowerCase();
  if (!isAllowedEmail(normalized)) {
    throw new Error("domain");
  }
  if (!isArea(area)) {
    throw new Error("area");
  }
  const admin = normalized === bootstrapAdminEmail();
  const row = await prisma.user.upsert({
    where: { email: normalized },
    create: {
      email: normalized,
      role: admin ? "admin" : "member",
      area: admin ? "" : area,
    },
    update: {
      role: admin ? "admin" : "member",
      area: admin ? "" : area,
    },
  });
  return {
    email: row.email,
    name: row.name,
    role: asRole(row.role),
    area: isArea(row.area) ? row.area : "",
  };
}

export function userCanEnter(user: AppUser) {
  if (user.role === "admin") {
    return true;
  }
  return user.role === "member" && isArea(user.area);
}
