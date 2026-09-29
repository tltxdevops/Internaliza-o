const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const outDir = path.join(__dirname, "..", "docs");
const staging = path.join(outDir, "_docx_staging");
const outFile = path.join(outDir, "cronograma-entregas.docx");

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

const sections = [
  { t: "Cronograma das 6 entregas — Internalização", bold: true, size: 36 },
  {
    t: "Épico TS-208. Início: 1º de setembro de 2026. Setembro = apresentar e homologar o piloto (entregas 1 a 5). Outubro = go-live (entrega 6).",
    size: 22,
  },
  { t: "Visão rápida", bold: true, size: 28 },
  { t: "Entrega 1 — Visão única — até 5 set 2026: board central e listas por área; INT; central só leitura.", size: 22 },
  { t: "Entrega 2 — Abrir e editar — até 12 set 2026: nova demanda no Comercial; painel de campos; salvar.", size: 22 },
  { t: "Entrega 3 — Máquina de status — até 19 set 2026: arrastar só o permitido; concluir destrava a próxima área.", size: 22 },
  { t: "Entrega 4 — Ajustes e retrabalho — até 26 set 2026: ajustes para Comercial e/ou Arquitetura; flag Retrabalho?.", size: 22 },
  { t: "Entrega 5 — Comentários — até 3 out 2026: fio de comentários no INT (autor entra com o login na 6).", size: 22 },
  { t: "Entrega 6 — Go-live — até 31 out 2026: login, permissões, hospedagem e campos que faltam do SharePoint.", size: 22 },
  { t: "Detalhe por data", bold: true, size: 28 },
  { t: "5 set — Entrega 1", bold: true, size: 26 },
  { t: "Board central, kanban/lista por área, INT no card, clique abre o detalhe. Encadeamento Comercial → Arquitetura → Internalização → Operações e Finanças. Central não edita status.", size: 22 },
  { t: "12 set — Entrega 2", bold: true, size: 26 },
  { t: "Nova demanda só no Comercial, INT gerado na hora, formulário completo no painel, regras na tela (prioridade, PrimeDeploy em Operações). Card do board continua enxuto.", size: 22 },
  { t: "19 set — Entrega 3", bold: true, size: 26 },
  { t: "Transições válidas no arrastar. Concluir destrava a próxima área. Demo de um INT até Ops/Fin. Drop inválido não move.", size: 22 },
  { t: "26 set — Entrega 4", bold: true, size: 26 },
  { t: "Pedir ajustes para Comercial e/ou Arquitetura, com justificativa. Flag vermelha só se Retrabalho? estiver marcado.", size: 22 },
  { t: "3 out — Entrega 5", bold: true, size: 26 },
  { t: "Comentários ao lado do formulário, visíveis em todas as áreas. Sem login ainda.", size: 22 },
  { t: "31 out — Entrega 6 (go-live)", bold: true, size: 26 },
  { t: "10 out: login. 17 out: permissões por área. 24 out: campos restantes do SharePoint, hospedagem e backup. 31 out: site oficial; SharePoint/PA deixa de ser o caminho principal.", size: 22 },
  { t: "Na reunião: validar estas datas e quem homologa cada fatia. Não misturar go-live com as demos 1 a 5.", size: 22 },
];

const body = sections.map((s, i) =>
  p(s.t, {
    bold: Boolean(s.bold),
    size: s.size ?? 22,
    spaceAfter: s.bold && s.size >= 28 && i > 0 ? 200 : 140,
  }),
);

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
const zip = `${outFile}.zip`;
execFileSync("powershell.exe", [
  "-NoProfile",
  "-Command",
  `Compress-Archive -Path '${staging.replace(/'/g, "''")}\\*' -DestinationPath '${zip.replace(/'/g, "''")}' -Force; Move-Item -Force '${zip.replace(/'/g, "''")}' '${outFile.replace(/'/g, "''")}'`,
], { stdio: "inherit" });
fs.rmSync(staging, { recursive: true, force: true });
console.log("Wrote", outFile);
