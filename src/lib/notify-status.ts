import { decodeList, lookupLabel, SERVICOS_CONTEMPLADOS } from "@/domain/demand-fields";
import {
  collectRecipients,
  recipientEmails,
} from "@/domain/notify-recipients";
import {
  AREA_LABEL,
  nextAreasFor,
  statusLabelForArea,
  type Area,
  APPROVAL_MANAGER_PLACEHOLDERS,
} from "@/domain/status-machine";
import {
  insertNotificationLog,
  listCatalogContactsForCodes,
} from "@/lib/catalog";
import { sendMail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";

type DemandNotifyRow = {
  id: string;
  intCode: string;
  title: string;
  cliente: string | null;
  servicosContemplados: string | null;
  busArquitetura: string | null;
  responsavelEmail: string | null;
  accountManagerEmail: string | null;
  gerenteProjetosEmail: string | null;
  liderTecnicoEmail: string | null;
};

function appUrl() {
  return (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

function demandLink(area: Area, demandId: string) {
  return `${appUrl()}/areas/${area}?demanda=${demandId}`;
}

export async function notifyStatusChange(input: {
  demandId: string;
  area: Area;
  from: string;
  to: string;
  ajustePara?: Area[];
  justificativa?: string;
  unlockedAreas?: Area[];
}) {
  try {
    const rows = await prisma.$queryRaw<DemandNotifyRow[]>`
      SELECT
        id, intCode, title, cliente,
        servicosContemplados, busArquitetura,
        responsavelEmail, accountManagerEmail,
        gerenteProjetosEmail, liderTecnicoEmail
      FROM "Demand"
      WHERE id = ${input.demandId}
      LIMIT 1
    `;
    const demand = rows[0];
    if (!demand) {
      return;
    }

    const contacts = await listCatalogContactsForCodes();
    const recipients = collectRecipients({
      demand: {
        responsavelEmail: demand.responsavelEmail ?? "",
        accountManagerEmail: demand.accountManagerEmail ?? "",
        gerenteProjetosEmail: demand.gerenteProjetosEmail ?? "",
        liderTecnicoEmail: demand.liderTecnicoEmail ?? "",
      },
      servicoCodes: decodeList(demand.servicosContemplados ?? ""),
      buCodes: decodeList(demand.busArquitetura ?? ""),
      contacts,
    });

    const approvalManagers =
      input.to === "aguardando_aprovacao"
        ? APPROVAL_MANAGER_PLACEHOLDERS.map((item) => ({
            email: item.email,
            source: "demanda" as const,
            label: item.label,
          }))
        : [];

    const merged = [...recipients];
    const seen = new Set(recipients.map((item) => item.email));
    for (const manager of approvalManagers) {
      const email = manager.email.trim().toLowerCase();
      if (!email || seen.has(email)) {
        continue;
      }
      seen.add(email);
      merged.push({ ...manager, email });
    }

    const to = recipientEmails(merged);
    const fromLabel = statusLabelForArea(input.area, input.from);
    const toLabel = statusLabelForArea(input.area, input.to);
    const areaLabel = AREA_LABEL[input.area];
    const cliente = (demand.cliente || demand.title || "").trim();
    const servicos = decodeList(demand.servicosContemplados ?? "")
      .map((code) => lookupLabel(SERVICOS_CONTEMPLADOS, code))
      .join(", ");

    let subject = `${demand.intCode} · ${areaLabel}: ${fromLabel} → ${toLabel}`;
    if (input.to === "aguardando_ajustes" && input.ajustePara?.length) {
      subject = `${demand.intCode} · ${areaLabel} pediu ajustes`;
    }
    if (input.to === "aguardando_aprovacao") {
      subject = `${demand.intCode} · enviar aprovação para gestores`;
    }

    const lines = [
      `${demand.intCode}${cliente ? ` — ${cliente}` : ""}`,
      `Área: ${areaLabel}`,
      `Status: ${fromLabel} → ${toLabel}`,
    ];
    if (servicos) {
      lines.push(`Serviços: ${servicos}`);
    }
    if (input.ajustePara?.length) {
      lines.push(
        `Ajustes para: ${input.ajustePara.map((area) => AREA_LABEL[area]).join(" e ")}`,
      );
    }
    if (input.justificativa) {
      lines.push(`Justificativa: ${input.justificativa}`);
    }
    if (input.unlockedAreas?.length) {
      lines.push(
        `Área(s) aberta(s): ${input.unlockedAreas.map((area) => AREA_LABEL[area]).join(", ")}`,
      );
    }
    if (input.to === "aguardando_aprovacao") {
      lines.push("");
      lines.push(
        `Enviar aprovação do card ${demand.intCode} para gestores:`,
      );
      for (const manager of APPROVAL_MANAGER_PLACEHOLDERS) {
        lines.push(`- ${manager.label} · ${manager.email}`);
      }
    }
    if (merged.length) {
      lines.push("");
      lines.push("Destinatários:");
      for (const recipient of merged) {
        lines.push(`- ${recipient.email} (${recipient.label})`);
      }
    } else {
      lines.push("");
      lines.push(
        "Nenhum destinatário: preencha e-mails no INT ou no cadastro do serviço/BU.",
      );
    }
    lines.push("");
    lines.push(demandLink(input.area, demand.id));

    const body = lines.join("\n");
    const mail = await sendMail({ to, subject, text: body });

    await insertNotificationLog({
      demandId: demand.id,
      intCode: demand.intCode,
      area: input.area,
      fromStatus: input.from,
      toStatus: input.to,
      recipients: to,
      subject,
      body,
      channel: mail.channel,
      error: mail.error,
    });
  } catch (error) {
    console.error("[notify]", error);
  }
}

export function nextAreasAfterConclude(
  area: Area,
  servicoCodes: string[] = [],
) {
  return nextAreasFor(area, servicoCodes);
}

