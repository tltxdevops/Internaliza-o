type MailPayload = {
  to: string[];
  subject: string;
  text: string;
};

export type MailResult = { channel: "log" | "smtp"; error?: string };

function overrideTo() {
  return (process.env.MAIL_OVERRIDE_TO || "")
    .split(/[,;]+/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export async function sendMail(payload: MailPayload): Promise<MailResult> {
  const override = overrideTo();
  const intended = payload.to
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  const to = override.length > 0 ? override : intended;

  if (to.length === 0) {
    console.info("[mail:log]", payload.subject, "(sem destinatários)");
    return { channel: "log" };
  }

  const text =
    override.length > 0
      ? [
          payload.text,
          "",
          "---",
          "Modo teste: este e-mail foi redirecionado.",
          `Destinatários originais: ${intended.length ? intended.join(", ") : "(nenhum)"}`,
          `Entregue apenas para: ${override.join(", ")}`,
        ].join("\n")
      : payload.text;

  const host = process.env.SMTP_HOST?.trim();
  if (!host) {
    console.info("[mail:log]", payload.subject, to.join(", "));
    return { channel: "log" };
  }

  try {
    const nodemailer = await import("nodemailer");
    const createTransport =
      nodemailer.createTransport ?? nodemailer.default.createTransport;
    const port = Number(process.env.SMTP_PORT || "587");
    const transporter = createTransport({
      host,
      port,
      secure: port === 465,
      requireTLS: port === 587,
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            }
          : undefined,
    });
    await transporter.sendMail({
      from:
        process.env.SMTP_FROM ||
        process.env.SMTP_USER ||
        "internalizacao@localhost",
      to: to.join(", "),
      subject: payload.subject,
      text,
    });
    return { channel: "smtp" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha ao enviar e-mail.";
    console.error("[mail:smtp]", message);
    return { channel: "smtp", error: message };
  }
}
