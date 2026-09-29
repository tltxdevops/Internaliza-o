import { isPlausibleEmail } from "@/domain/demand-fields";

export const CATALOG_KINDS = ["servico", "bu", "sa_se"] as const;

export type CatalogKind = (typeof CATALOG_KINDS)[number];

export const CATALOG_KIND_LABEL: Record<CatalogKind, string> = {
  servico: "Serviços contemplados",
  bu: "BUs Arquitetura",
  sa_se: "SA/SEs Arquitetura",
};

export function isCatalogKind(value: string): value is CatalogKind {
  return (CATALOG_KINDS as readonly string[]).includes(value);
}

export type CatalogContactRow = {
  kind: string;
  code: string;
  email: string;
  label: string;
};

export type DemandNotifyEmails = {
  responsavelEmail: string;
  accountManagerEmail: string;
  gerenteProjetosEmail: string;
  liderTecnicoEmail: string;
};

export type NotifyRecipient = {
  email: string;
  source: "demanda" | CatalogKind;
  label: string;
};

function pushUnique(
  list: NotifyRecipient[],
  seen: Set<string>,
  email: string,
  source: NotifyRecipient["source"],
  label: string,
) {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !isPlausibleEmail(normalized) || seen.has(normalized)) {
    return;
  }
  seen.add(normalized);
  list.push({ email: normalized, source, label });
}

export function collectRecipients(input: {
  demand: DemandNotifyEmails;
  servicoCodes: string[];
  buCodes: string[];
  contacts: CatalogContactRow[];
}): NotifyRecipient[] {
  const seen = new Set<string>();
  const list: NotifyRecipient[] = [];

  pushUnique(
    list,
    seen,
    input.demand.responsavelEmail,
    "demanda",
    "Responsável",
  );
  pushUnique(
    list,
    seen,
    input.demand.accountManagerEmail,
    "demanda",
    "Account Manager",
  );
  pushUnique(
    list,
    seen,
    input.demand.gerenteProjetosEmail,
    "demanda",
    "Gerente de Projetos",
  );
  pushUnique(
    list,
    seen,
    input.demand.liderTecnicoEmail,
    "demanda",
    "Líder Técnico",
  );

  const servicos = new Set(input.servicoCodes);
  const bus = new Set(input.buCodes);

  for (const contact of input.contacts) {
    const email = contact.email;
    if (contact.kind === "servico" && servicos.has(contact.code)) {
      pushUnique(list, seen, email, "servico", contact.label);
    } else if (contact.kind === "bu" && bus.has(contact.code)) {
      pushUnique(list, seen, email, "bu", contact.label);
    }
  }

  return list;
}

export function recipientEmails(recipients: NotifyRecipient[]) {
  return recipients.map((item) => item.email);
}
