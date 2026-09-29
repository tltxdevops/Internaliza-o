const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const outDir = path.join(__dirname, "..", "docs");
const staging = path.join(outDir, "_docx_staging");
const outFile = path.join(outDir, "seis-entregas.docx");

function xmlText(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function p(text, opts = {}) {
  const { bold, size = 22, spaceAfter = 120 } = opts;
  const rPr = `<w:rPr>${bold ? "<w:b/>" : ""}<w:sz w:val="${size}"/><w:szCs w:val="${size}"/></w:rPr>`;
  const lines = xmlText(text).split("\n");
  const runs = lines
    .map(
      (line, i) =>
        `<w:r>${rPr}<w:t xml:space="preserve">${line}</w:t></w:r>${
          i < lines.length - 1 ? '<w:r><w:br/></w:r>' : ""
        }`,
    )
    .join("");
  return `<w:p><w:pPr><w:spacing w:after="${spaceAfter}"/></w:pPr>${runs}</w:p>`;
}

const entregas = [
  {
    titulo: "Entrega 1 — Visão única",
    corpo: [
      "O que se vê: board central e kanban/lista por área; INT no card; clique no INT abre o detalhe.",
      "O que substitui: “cadê o card?” entre várias listas do SharePoint.",
      "Melhoria: um INT e uma visão de onde está cada demanda. O board central é só leitura.",
      "Aceite: encadeamento visível Comercial → Arquitetura → Internalização → Operações e Finanças. Central não edita status.",
    ],
  },
  {
    titulo: "Entrega 2 — Abrir e editar demanda",
    corpo: [
      "O que se vê: nova demanda só no Comercial; INT gerado na hora; painel com os campos da demanda.",
      "O que substitui: formulário e colunas da lista SharePoint.",
      "Melhoria: um formulário com regras na tela (prioridade Alta/Crítica, Retrabalho?, GP e líder técnico só em Operações com PrimeDeploy). O card do board continua enxuto.",
      "Aceite: criar, reabrir e salvar. O kanban mostra só o resumo; o detalhe fica no painel.",
    ],
  },
  {
    titulo: "Entrega 3 — Máquina de status",
    corpo: [
      "O que se vê: o card só vai para o próximo status permitido. Concluir uma área destrava a seguinte.",
      "O que substitui: fluxos Power Automate que mudam coluna ou criam item na lista da próxima área.",
      "Melhoria: a regra mora no site, com menos dependência de fluxo parado ou lista dessincronizada.",
      "Aceite: um INT do Comercial até Operações/Finanças. Um movimento inválido não altera o card.",
    ],
  },
  {
    titulo: "Entrega 4 — Ajustes e retrabalho",
    corpo: [
      "O que se vê: Internalização, Operações ou Finanças pedem ajustes para Comercial e/ou Arquitetura, com justificativa. Os destinos vão para Retrabalho. Se os dois forem escolhidos, quem pediu só retoma quando os dois saírem de Retrabalho.",
      "O que substitui: devolução e visibilidade de retrabalho no Power Automate e nas listas.",
      "Melhoria: destino múltiplo. A flag vermelha RETRABALHO no card só aparece se o campo Retrabalho? do formulário estiver marcado. Entrar na coluna Retrabalho sozinho não coloca a flag.",
      "Aceite: um caso só Comercial e um caso os dois. Flag alinhada ao campo, não à coluna.",
    ],
  },
  {
    titulo: "Entrega 5 — Comentários no INT",
    corpo: [
      "O que se vê: ao abrir o card, formulário à esquerda e comentários à direita. O mesmo fio em todas as áreas.",
      "O que substitui: comentário espalhado em lista, Teams ou e-mail do fluxo.",
      "Melhoria: a conversa fica colada no INT.",
      "Limitação: ainda não há login; o autor entra quando houver autenticação.",
      "Aceite: publicar um comentário numa área e vê-lo em outra.",
    ],
  },
  {
    titulo: "Entrega 6 — Acesso, operação e restante do SharePoint",
    corpo: [
      "O que se vê: login, permissões por área, campos ainda não migrados, hospedagem e backup.",
      "O que substitui: permissão de lista SharePoint e, no que for escopo, alertas do Power Automate.",
      "Melhoria: o site vira o sistema oficial, não o piloto.",
      "Fora do piloto atual (exemplos): Contempla serviços Cisco; Tem PrimeDeploy / Tem Adoption como campos próprios; justificativa da internalização; pasta SharePoint.",
      "Aceite: papéis (ex.: Comercial vs Operações), auditoria mínima e ambiente que não é só localhost.",
    ],
  },
];

const body = [
  p("Site de Internalização", { bold: true, size: 36, spaceAfter: 80 }),
  p("As seis entregas", { bold: true, size: 28, spaceAfter: 240 }),
  p(
    "Substituição do processo atual (SharePoint + Power Automate) por um site, em fatias que dão para apresentar e validar.",
    { size: 22, spaceAfter: 360 },
  ),
];

for (const item of entregas) {
  body.push(p(item.titulo, { bold: true, size: 26, spaceAfter: 160 }));
  for (const line of item.corpo) {
    body.push(p(line, { size: 22, spaceAfter: 80 }));
  }
  body.push(p("", { size: 22, spaceAfter: 200 }));
}

const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${body.join("\n")}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/>
    </w:sectPr>
  </w:body>
</w:document>`;

const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

fs.rmSync(staging, { recursive: true, force: true });
fs.mkdirSync(path.join(staging, "_rels"), { recursive: true });
fs.mkdirSync(path.join(staging, "word"), { recursive: true });
fs.writeFileSync(path.join(staging, "[Content_Types].xml"), contentTypes);
fs.writeFileSync(path.join(staging, "_rels", ".rels"), rels);
fs.writeFileSync(path.join(staging, "word", "document.xml"), documentXml);

if (fs.existsSync(outFile)) fs.unlinkSync(outFile);

execFileSync(
  "powershell.exe",
  [
    "-NoProfile",
    "-Command",
    `Compress-Archive -Path '${staging.replace(/'/g, "''")}\\*' -DestinationPath '${outFile.replace(/'/g, "''")}.zip' -Force; Move-Item -Force '${outFile.replace(/'/g, "''")}.zip' '${outFile.replace(/'/g, "''")}'`,
  ],
  { stdio: "inherit" },
);

fs.rmSync(staging, { recursive: true, force: true });
console.log("Wrote", outFile);
