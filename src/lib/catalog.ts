import {
  BUS_ARQUITETURA,
  SA_SES_ARQUITETURA,
  SERVICOS_CONTEMPLADOS,
  isPlausibleEmail,
  type LookupOption,
} from "@/domain/demand-fields";
import {
  CATALOG_KINDS,
  isCatalogKind,
  type CatalogKind,
} from "@/domain/notify-recipients";
import { prisma } from "@/lib/prisma";

export type CatalogItemModel = {
  id: string;
  kind: CatalogKind;
  code: string;
  label: string;
  contacts: CatalogContactModel[];
};

export type CatalogContactModel = {
  id: string;
  email: string;
  displayName: string;
  role: string;
};

export type NotificationLogModel = {
  id: string;
  demandId: string;
  intCode: string;
  area: string;
  fromStatus: string;
  toStatus: string;
  recipients: string[];
  subject: string;
  body: string;
  channel: string;
  error: string;
  createdAt: string;
};

async function ensureCatalogTables() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "CatalogItem" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "kind" TEXT NOT NULL,
      "code" TEXT NOT NULL,
      "label" TEXT NOT NULL,
      UNIQUE("kind", "code")
    )
  `);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "CatalogContact" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "catalogItemId" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "displayName" TEXT NOT NULL DEFAULT '',
      "role" TEXT NOT NULL DEFAULT '',
      FOREIGN KEY ("catalogItemId") REFERENCES "CatalogItem"("id") ON DELETE CASCADE
    )
  `);
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "NotificationLog" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "demandId" TEXT NOT NULL,
      "intCode" TEXT NOT NULL,
      "area" TEXT NOT NULL,
      "fromStatus" TEXT NOT NULL,
      "toStatus" TEXT NOT NULL,
      "recipients" TEXT NOT NULL,
      "subject" TEXT NOT NULL,
      "body" TEXT NOT NULL,
      "channel" TEXT NOT NULL,
      "error" TEXT NOT NULL DEFAULT '',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function seedCatalogItems() {
  const rows: Array<{ kind: CatalogKind; code: string; label: string }> = [
    ...SERVICOS_CONTEMPLADOS.map((item) => ({
      kind: "servico" as const,
      code: item.value,
      label: item.label,
    })),
    ...BUS_ARQUITETURA.map((item) => ({
      kind: "bu" as const,
      code: item.value,
      label: item.label,
    })),
    ...SA_SES_ARQUITETURA.map((item) => ({
      kind: "sa_se" as const,
      code: item.value,
      label: item.label,
    })),
  ];

  for (const row of rows) {
    const id = crypto.randomUUID();
    await prisma.$executeRaw`
      INSERT OR IGNORE INTO "CatalogItem" ("id", "kind", "code", "label")
      VALUES (${id}, ${row.kind}, ${row.code}, ${row.label})
    `;
  }
}

export async function ensureCatalog() {
  await ensureCatalogTables();
  await seedCatalogItems();
}

export async function listCatalog(kind: CatalogKind): Promise<CatalogItemModel[]> {
  await ensureCatalog();
  const items = await prisma.$queryRaw<
    Array<{ id: string; kind: string; code: string; label: string }>
  >`
    SELECT id, kind, code, label
    FROM "CatalogItem"
    WHERE kind = ${kind}
    ORDER BY label COLLATE NOCASE
  `;
  const contacts = await prisma.$queryRaw<
    Array<{
      id: string;
      catalogItemId: string;
      email: string;
      displayName: string;
      role: string;
    }>
  >`
    SELECT id, catalogItemId, email, displayName, role
    FROM "CatalogContact"
  `;
  const byItem = new Map<string, CatalogContactModel[]>();
  for (const contact of contacts) {
    const list = byItem.get(contact.catalogItemId) ?? [];
    list.push({
      id: contact.id,
      email: contact.email,
      displayName: contact.displayName,
      role: contact.role,
    });
    byItem.set(contact.catalogItemId, list);
  }
  return items.flatMap((item) => {
    if (!isCatalogKind(item.kind)) {
      return [];
    }
    return [
      {
        id: item.id,
        kind: item.kind,
        code: item.code,
        label: item.label,
        contacts: byItem.get(item.id) ?? [],
      },
    ];
  });
}

export async function listCatalogContactsForCodes() {
  await ensureCatalog();
  return prisma.$queryRaw<
    Array<{ kind: string; code: string; email: string; label: string }>
  >`
    SELECT i.kind, i.code, c.email, i.label
    FROM "CatalogContact" c
    INNER JOIN "CatalogItem" i ON i.id = c.catalogItemId
  `;
}

export type FormLookups = {
  servicos: LookupOption[];
  bus: LookupOption[];
  saSes: LookupOption[];
};

function toLookup(items: CatalogItemModel[]): LookupOption[] {
  return items.map((item) => ({ value: item.code, label: item.label }));
}

/** Opções dos campos do card, lidas do cadastro. */
export async function listFormLookups(): Promise<FormLookups> {
  const [servicos, bus, saSes] = await Promise.all([
    listCatalog("servico"),
    listCatalog("bu"),
    listCatalog("sa_se"),
  ]);
  return {
    servicos: toLookup(servicos),
    bus: toLookup(bus),
    saSes: toLookup(saSes),
  };
}

const SEED_BY_KIND: Record<CatalogKind, LookupOption[]> = {
  servico: SERVICOS_CONTEMPLADOS,
  bu: BUS_ARQUITETURA,
  sa_se: SA_SES_ARQUITETURA,
};

export async function addCatalogItem(input: {
  kind: string;
  label: string;
}): Promise<{ error?: string }> {
  await ensureCatalog();
  if (!isCatalogKind(input.kind)) {
    return { error: "Tipo de cadastro inválido." };
  }
  const label = input.label.trim();
  if (!label) {
    return { error: "Informe o nome." };
  }
  const known = SEED_BY_KIND[input.kind].find(
    (item) =>
      item.label.localeCompare(label, "pt-BR", { sensitivity: "accent" }) ===
        0 || item.value.localeCompare(label, "pt-BR", { sensitivity: "accent" }) === 0,
  );
  const code = known?.value ?? label;
  const id = crypto.randomUUID();
  const inserted = await prisma.$executeRaw`
    INSERT OR IGNORE INTO "CatalogItem" ("id", "kind", "code", "label")
    VALUES (${id}, ${input.kind}, ${code}, ${known?.label ?? label})
  `;
  if (Number(inserted) === 0) {
    return { error: "Esse item já está no cadastro." };
  }
  return {};
}

export async function removeCatalogItem(itemId: string) {
  await ensureCatalog();
  await prisma.$executeRaw`
    DELETE FROM "CatalogContact" WHERE catalogItemId = ${itemId}
  `;
  await prisma.$executeRaw`
    DELETE FROM "CatalogItem" WHERE id = ${itemId}
  `;
}

export async function addCatalogContact(input: {
  itemId: string;
  email: string;
  displayName?: string;
  role?: string;
}): Promise<{ error?: string }> {
  await ensureCatalog();
  const email = input.email.trim().toLowerCase();
  if (!email || !isPlausibleEmail(email)) {
    return { error: "Informe um e-mail válido." };
  }
  const items = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id FROM "CatalogItem" WHERE id = ${input.itemId} LIMIT 1
  `;
  if (items.length === 0) {
    return { error: "Item de catálogo não encontrado." };
  }
  const existing = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id FROM "CatalogContact"
    WHERE catalogItemId = ${input.itemId} AND lower(email) = ${email}
    LIMIT 1
  `;
  if (existing.length > 0) {
    return { error: "Este e-mail já está neste item." };
  }
  const id = crypto.randomUUID();
  const displayName = (input.displayName ?? "").trim();
  const role = (input.role ?? "").trim();
  await prisma.$executeRaw`
    INSERT INTO "CatalogContact" ("id", "catalogItemId", "email", "displayName", "role")
    VALUES (${id}, ${input.itemId}, ${email}, ${displayName}, ${role})
  `;
  return {};
}

export async function removeCatalogContact(contactId: string) {
  await ensureCatalog();
  await prisma.$executeRaw`
    DELETE FROM "CatalogContact" WHERE id = ${contactId}
  `;
}

export async function insertNotificationLog(input: {
  demandId: string;
  intCode: string;
  area: string;
  fromStatus: string;
  toStatus: string;
  recipients: string[];
  subject: string;
  body: string;
  channel: string;
  error?: string;
}) {
  await ensureCatalog();
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const recipients = JSON.stringify(input.recipients);
  const error = input.error ?? "";
  await prisma.$executeRaw`
    INSERT INTO "NotificationLog" (
      "id", "demandId", "intCode", "area", "fromStatus", "toStatus",
      "recipients", "subject", "body", "channel", "error", "createdAt"
    )
    VALUES (
      ${id}, ${input.demandId}, ${input.intCode}, ${input.area},
      ${input.fromStatus}, ${input.toStatus}, ${recipients},
      ${input.subject}, ${input.body}, ${input.channel}, ${error}, ${createdAt}
    )
  `;
}

export async function listNotificationLogs(
  limit = 40,
): Promise<NotificationLogModel[]> {
  await ensureCatalog();
  const rows = await prisma.$queryRaw<
    Array<{
      id: string;
      demandId: string;
      intCode: string;
      area: string;
      fromStatus: string;
      toStatus: string;
      recipients: string;
      subject: string;
      body: string;
      channel: string;
      error: string;
      createdAt: string | Date;
    }>
  >`
    SELECT * FROM "NotificationLog"
    ORDER BY "createdAt" DESC
  `;
  return rows.slice(0, limit).map((row) => {
    let recipients: string[] = [];
    try {
      const parsed = JSON.parse(row.recipients) as unknown;
      if (Array.isArray(parsed)) {
        recipients = parsed.map(String);
      }
    } catch {
      recipients = [];
    }
    return {
      id: row.id,
      demandId: row.demandId,
      intCode: row.intCode,
      area: row.area,
      fromStatus: row.fromStatus,
      toStatus: row.toStatus,
      recipients,
      subject: row.subject,
      body: row.body,
      channel: row.channel,
      error: row.error,
      createdAt:
        row.createdAt instanceof Date
          ? row.createdAt.toISOString()
          : String(row.createdAt),
    };
  });
}

export { CATALOG_KINDS };
