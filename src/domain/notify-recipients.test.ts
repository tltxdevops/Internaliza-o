import assert from "node:assert/strict";
import { test } from "node:test";
import { collectRecipients } from "./notify-recipients";

test("cruza e-mails da demanda com lookup de serviço e BU", () => {
  const recipients = collectRecipients({
    demand: {
      responsavelEmail: "resp@teletex.com",
      accountManagerEmail: "am@teletex.com",
      gerenteProjetosEmail: "",
      liderTecnicoEmail: "invalido",
    },
    servicoCodes: ["prime_deploy", "NOC"],
    buCodes: ["Segurança"],
    contacts: [
      {
        kind: "servico",
        code: "NOC",
        email: "noc@teletex.com",
        label: "NOC",
      },
      {
        kind: "servico",
        code: "SOC",
        email: "soc@teletex.com",
        label: "SOC",
      },
      {
        kind: "bu",
        code: "Segurança",
        email: "sec@teletex.com",
        label: "Segurança",
      },
    ],
  });

  assert.deepEqual(
    recipients.map((item) => item.email),
    [
      "resp@teletex.com",
      "am@teletex.com",
      "noc@teletex.com",
      "sec@teletex.com",
    ],
  );
  assert.equal(
    recipients.find((item) => item.email === "noc@teletex.com")?.source,
    "servico",
  );
});

test("não duplica o mesmo e-mail se já veio da demanda", () => {
  const recipients = collectRecipients({
    demand: {
      responsavelEmail: "mesmo@teletex.com",
      accountManagerEmail: "",
      gerenteProjetosEmail: "",
      liderTecnicoEmail: "",
    },
    servicoCodes: ["NOC"],
    buCodes: [],
    contacts: [
      {
        kind: "servico",
        code: "NOC",
        email: "MESMO@teletex.com",
        label: "NOC",
      },
    ],
  });
  assert.equal(recipients.length, 1);
  assert.equal(recipients[0]?.source, "demanda");
});
