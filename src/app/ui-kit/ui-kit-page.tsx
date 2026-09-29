"use client";

import { useMemo, useState, type ReactNode } from "react";

type TabId =
  | "foundations"
  | "patterns"
  | "components"
  | "templates"
  | "semantic";

const TABS: { id: TabId; label: string }[] = [
  { id: "foundations", label: "FOUNDATIONS" },
  { id: "patterns", label: "PATTERNS" },
  { id: "components", label: "COMPONENTS" },
  { id: "templates", label: "TEMPLATES" },
  { id: "semantic", label: "SEMANTIC STATES" },
];

function Badge({
  label,
  tone,
}: {
  label: string;
  tone:
    | "danger"
    | "success"
    | "warning"
    | "info"
    | "cyan"
    | "purple"
    | "orange"
    | "indigo"
    | "neutral"
    | "disaster";
}) {
  const map = {
    danger: {
      bg: "var(--ov-danger-soft)",
      border: "var(--ov-danger-border)",
      color: "var(--ov-danger)",
    },
    success: {
      bg: "var(--ov-success-soft)",
      border: "var(--ov-success-border)",
      color: "var(--ov-success)",
    },
    warning: {
      bg: "var(--ov-warning-soft)",
      border: "var(--ov-warning-border)",
      color: "var(--ov-warning)",
    },
    info: {
      bg: "var(--ov-info-soft)",
      border: "var(--ov-info-border)",
      color: "var(--ov-info)",
    },
    cyan: {
      bg: "var(--ov-cyan-soft)",
      border: "var(--ov-cyan-border)",
      color: "var(--ov-cyan)",
    },
    purple: {
      bg: "var(--ov-purple-soft)",
      border: "var(--ov-purple-border)",
      color: "var(--ov-purple)",
    },
    orange: {
      bg: "var(--ov-orange-soft)",
      border: "var(--ov-orange-border)",
      color: "var(--ov-orange)",
    },
    indigo: {
      bg: "var(--ov-indigo-soft)",
      border: "var(--ov-indigo-border)",
      color: "var(--ov-indigo)",
    },
    neutral: {
      bg: "var(--ov-neutral-soft)",
      border: "var(--ov-neutral-border)",
      color: "var(--ov-neutral)",
    },
    disaster: {
      bg: "var(--ov-disaster)",
      border: "var(--ov-disaster)",
      color: "#fff",
    },
  } as const;
  const t = map[tone];
  return (
    <span
      className="ov-badge"
      style={{
        background: t.bg,
        borderColor: t.border,
        color: t.color,
      }}
    >
      {tone !== "disaster" ? (
        <span className="ov-badge-dot" style={{ background: t.color }} />
      ) : null}
      {label}
    </span>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="ov-title ov-title-underscore text-[16px] text-[var(--ov-text)]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function ColorSwatch({
  name,
  token,
  hex,
}: {
  name: string;
  token: string;
  hex: string;
}) {
  return (
    <div className="ov-swatch">
      <div className="ov-swatch-chip" style={{ background: hex }} />
      <div className="space-y-0.5 border-t border-[var(--ov-border)] px-3 py-2">
        <p className="text-[13px] font-semibold text-[var(--ov-text)]">{name}</p>
        <p className="font-[family-name:var(--ov-font-display)] text-[11px] text-[var(--ov-text-muted)]">
          {token}
        </p>
        <p className="text-[11px] text-[var(--ov-text-secondary)]">{hex}</p>
      </div>
    </div>
  );
}

function Foundations() {
  return (
    <div className="flex flex-col gap-8">
      <Section title="Decisões">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Superfície neutra primeiro", "Panels brancos, sem sombra"],
            ["Ação primária preta", "CTA e confirmações"],
            ["Accent blue", "Nav ativa, seleção, underscore"],
            ["Radius 12 / 8 / 999", "Panel / controle / pill"],
            ["Borda 1px", "Sem drop shadow em cards"],
            ["Tipografia dual", "JetBrains Mono + Lato"],
          ].map(([title, desc]) => (
            <div key={title} className="ov-panel">
              <p className="text-[14px] font-semibold">{title}</p>
              <p className="mt-1 text-[12px] text-[var(--ov-text-secondary)]">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Tipografia">
        <div className="ov-panel grid gap-4">
          <div>
            <p className="ov-title text-[20px]">Page title · 20 / 600</p>
            <p className="mt-1 text-[12px] text-[var(--ov-text-muted)]">
              JetBrains Mono
            </p>
          </div>
          <div>
            <p className="ov-title text-[16px]">Section title · 16 / 600</p>
            <p className="mt-1 text-[12px] text-[var(--ov-text-muted)]">
              JetBrains Mono · com underscore_
            </p>
          </div>
          <div>
            <p className="ov-title text-[28px] font-bold">102</p>
            <p className="mt-1 text-[12px] text-[var(--ov-text-muted)]">
              Metric · 28 / 700
            </p>
          </div>
          <div>
            <p className="text-[14px] font-normal text-[var(--ov-text)]">
              Body text · Lato 14 / 400 — usado em tabelas, formulários e
              descrições operacionais.
            </p>
          </div>
          <div>
            <p className="text-[12px] font-semibold text-[var(--ov-text-secondary)]">
              Secondary · Lato 12 / 600
            </p>
            <p className="mt-1 text-[12px] font-normal text-[var(--ov-text-muted)]">
              Caption · Lato 12 / 400
            </p>
          </div>
        </div>
      </Section>

      <Section title="Espaçamento">
        <div className="ov-panel flex flex-wrap items-end gap-4">
          {[4, 8, 12, 16, 24, 32].map((size) => (
            <div key={size} className="flex flex-col items-center gap-2">
              <div
                className="rounded bg-[var(--ov-accent)]"
                style={{ width: size, height: size }}
              />
              <span className="font-[family-name:var(--ov-font-display)] text-[11px] text-[var(--ov-text-muted)]">
                {size}px
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Cores">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ColorSwatch name="Background" token="--ov-bg" hex="#F4F5F7" />
          <ColorSwatch name="Surface" token="--ov-surface" hex="#FFFFFF" />
          <ColorSwatch name="Border" token="--ov-border" hex="#E4E7EC" />
          <ColorSwatch name="Text" token="--ov-text" hex="#101828" />
          <ColorSwatch name="Primary" token="--ov-primary" hex="#101828" />
          <ColorSwatch name="Accent" token="--ov-accent" hex="#2E90FA" />
          <ColorSwatch name="Success" token="--ov-success" hex="#12B76A" />
          <ColorSwatch name="Warning" token="--ov-warning" hex="#F79009" />
          <ColorSwatch name="Danger" token="--ov-danger" hex="#F04438" />
          <ColorSwatch name="Info" token="--ov-info" hex="#2E90FA" />
          <ColorSwatch name="Purple" token="--ov-purple" hex="#7A5AF8" />
          <ColorSwatch name="Disaster" token="--ov-disaster" hex="#EE46BC" />
        </div>
      </Section>
    </div>
  );
}

function Patterns() {
  return (
    <div className="flex flex-col gap-8">
      <Section title="PATTERN 01 · Page header">
        <div className="ov-panel flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="ov-title text-[20px]">Internalização / Comercial</h3>
            <p className="mt-1 text-[14px] text-[var(--ov-text-secondary)]">
              Visão operacional da fila de demandas
            </p>
            <div className="mt-3 flex items-center gap-2 text-[12px] font-semibold text-[var(--ov-success)]">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: "var(--ov-success)" }}
              />
              Site saudável
            </div>
          </div>
          <button type="button" className="ov-btn ov-btn-primary">
            Nova demanda
          </button>
        </div>
      </Section>

      <Section title="PATTERN 02 · Operational page">
        <div className="ov-panel flex flex-col gap-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Em retrabalho", "4", "var(--ov-danger)"],
              ["Aguardando ajustes", "2", "var(--ov-purple)"],
              ["Em andamento", "9", "var(--ov-warning)"],
            ].map(([label, value, color]) => (
              <div
                key={label}
                className="rounded-[var(--ov-radius-panel)] border border-[var(--ov-border)] p-4"
              >
                <p className="text-[12px] font-semibold text-[var(--ov-text-secondary)]">
                  {label}
                </p>
                <p
                  className="ov-title mt-1 text-[28px] font-bold"
                  style={{ color }}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <select className="ov-select max-w-[180px]">
              <option>Todas as frentes</option>
              <option>PMO</option>
              <option>Finanças</option>
            </select>
            <div className="relative min-w-[220px] flex-1">
              <input className="ov-input pl-9" placeholder="Buscar INT ou cliente" />
              <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[var(--ov-text-muted)]">
                ⌕
              </span>
            </div>
            <button type="button" className="ov-btn ov-btn-secondary">
              Mais filtros
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="ov-badge" style={{ background: "var(--ov-accent-soft)", borderColor: "var(--ov-accent-border)", color: "var(--ov-accent)" }}>
              Retrabalho
            </span>
            <button type="button" className="text-[12px] font-semibold text-[var(--ov-accent)]">
              Limpar filtros
            </button>
          </div>
          <table className="ov-table">
            <thead>
              <tr>
                <th>INT</th>
                <th>Status</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-semibold">INT0007</td>
                <td>
                  <Badge label="Retrabalho" tone="danger" />
                </td>
                <td>
                  <button type="button" className="text-[14px] font-semibold text-[var(--ov-accent)]">
                    Abrir
                  </button>
                </td>
              </tr>
              <tr>
                <td className="font-semibold">INT0004</td>
                <td>
                  <Badge label="Em andamento" tone="cyan" />
                </td>
                <td>
                  <button type="button" className="text-[14px] font-semibold text-[var(--ov-accent)]">
                    Abrir
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="PATTERN 05 · Drawer">
        <div className="ov-panel max-w-md border-[var(--ov-border)] p-0 overflow-hidden">
          <div className="flex items-start justify-between gap-3 border-b border-[var(--ov-border)] px-4 py-4">
            <div>
              <p className="ov-title text-[16px]">INT0007 · Cliente Demo</p>
              <div className="mt-2">
                <Badge label="Retrabalho" tone="danger" />
              </div>
            </div>
            <button type="button" className="ov-btn ov-btn-ghost h-8 px-2 text-[12px]">
              Fechar
            </button>
          </div>
          <div className="flex flex-col gap-3 p-4">
            {["Resumo", "Pedido de ajustes", "Campos da demanda"].map((block) => (
              <div
                key={block}
                className="rounded-[var(--ov-radius-control)] border border-[var(--ov-border)] bg-[var(--ov-surface-muted)] px-3 py-3"
              >
                <p className="text-[12px] font-semibold text-[var(--ov-text-secondary)]">
                  {block}
                </p>
                <p className="mt-1 text-[13px] text-[var(--ov-text-muted)]">
                  Conteúdo operacional
                </p>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 border-t border-[var(--ov-border)] px-4 py-3">
            <button type="button" className="ov-btn ov-btn-secondary">
              Fechar
            </button>
            <button type="button" className="ov-btn ov-btn-primary">
              Salvar
            </button>
          </div>
        </div>
      </Section>
    </div>
  );
}

function Components() {
  return (
    <div className="flex flex-col gap-8">
      <Section title="Buttons">
        <div className="ov-panel flex flex-wrap gap-2">
          <button type="button" className="ov-btn ov-btn-primary">
            Primary
          </button>
          <button type="button" className="ov-btn ov-btn-secondary">
            Secondary
          </button>
          <button type="button" className="ov-btn ov-btn-ghost">
            Ghost
          </button>
          <button type="button" className="ov-btn ov-btn-danger">
            Danger
          </button>
          <button type="button" className="ov-btn ov-btn-secondary" disabled>
            Disabled
          </button>
        </div>
      </Section>

      <Section title="Inputs">
        <div className="ov-panel grid max-w-lg gap-3">
          <label className="flex flex-col gap-1 text-[12px] font-semibold text-[var(--ov-text-secondary)]">
            Nome
            <input className="ov-input" placeholder="Nome da configuração" />
          </label>
          <label className="flex flex-col gap-1 text-[12px] font-semibold text-[var(--ov-text-secondary)]">
            Contexto
            <select className="ov-select" defaultValue="operacional">
              <option value="operacional">Operacional</option>
              <option value="financeiro">Financeiro</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-[14px]">
            <input type="checkbox" defaultChecked />
            Retrabalho solicitado
          </label>
        </div>
      </Section>

      <Section title="Alerts">
        <div className="grid gap-3">
          {[
            ["Success", "var(--ov-success-soft)", "var(--ov-success-border)", "var(--ov-success)", "Ajustes concluídos e frente retomada."],
            ["Warning", "var(--ov-warning-soft)", "var(--ov-warning-border)", "var(--ov-warning)", "Arquitetura ainda precisa validar."],
            ["Error", "var(--ov-danger-soft)", "var(--ov-danger-border)", "var(--ov-danger)", "Justificativa obrigatória no pedido."],
            ["Info", "var(--ov-info-soft)", "var(--ov-info-border)", "var(--ov-info)", "UI Kit v1.1 frozen — use estes tokens."],
          ].map(([name, bg, border, color, text]) => (
            <div
              key={name}
              className="rounded-[var(--ov-radius-control)] border px-3 py-3 text-[14px]"
              style={{ background: bg, borderColor: border, color }}
            >
              <span className="font-semibold">{name}</span>
              <span className="ml-2 font-normal text-[var(--ov-text)]">{text}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="KPI + Panel">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["Total", "102"],
            ["Abertas", "37"],
            ["Concluídas", "65"],
          ].map(([label, value]) => (
            <div key={label} className="ov-panel">
              <p className="text-[12px] font-semibold text-[var(--ov-text-secondary)]">
                {label}
              </p>
              <p className="ov-title mt-1 text-[28px] font-bold">{value}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Templates() {
  const templates = [
    {
      name: "Operational List",
      blocks: ["Header", "Filters", "KPIs", "Table"],
    },
    {
      name: "Dashboard",
      blocks: ["Health", "KPIs", "Widget", "Widget"],
    },
    {
      name: "History / Search",
      blocks: ["Search", "Period", "Table", "Detail"],
    },
    {
      name: "Incident Queue",
      blocks: ["Tabs", "Filters", "Queue", "Detail"],
    },
    {
      name: "Operational Overview",
      blocks: ["Header", "Context", "Summary", "Grid 60/40"],
    },
    {
      name: "NOC Monitoring",
      blocks: ["Filters", "Severity", "Queue", "Incidents"],
    },
    {
      name: "Settings / Form",
      blocks: ["Header", "Fields", "Actions"],
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[14px] text-[var(--ov-text-secondary)]">
        TEMPLATES / Estruturas iniciais para novas telas
      </p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {templates.map((template) => (
          <div key={template.name} className="ov-panel flex flex-col gap-3">
            <p className="ov-title text-[14px]">{template.name}</p>
            <div className="grid grid-cols-2 gap-2">
              {template.blocks.map((block) => (
                <div
                  key={block}
                  className="ov-wire"
                  style={{ minHeight: block.includes("Table") || block.includes("Queue") ? 72 : 36 }}
                >
                  {block}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-[var(--ov-text-muted)]">
              Preview estrutural baseado em patterns oficiais.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SemanticStates() {
  return (
    <div className="flex flex-col gap-8">
      <Section title="Monitoramento">
        <div className="ov-panel flex flex-wrap gap-2">
          <Badge label="Em falha" tone="danger" />
          <Badge label="Normalizado" tone="success" />
        </div>
      </Section>

      <Section title="Fluxo / status">
        <div className="ov-panel flex flex-wrap gap-2">
          <Badge label="Não iniciado" tone="neutral" />
          <Badge label="Em andamento" tone="cyan" />
          <Badge label="Em pausa" tone="warning" />
          <Badge label="Aguardando aprovação" tone="info" />
          <Badge label="Aguardando ajustes" tone="purple" />
          <Badge label="Retrabalho" tone="danger" />
          <Badge label="Concluído" tone="success" />
        </div>
      </Section>

      <Section title="Operacional">
        <div className="ov-panel flex flex-wrap gap-2">
          <Badge label="Divergência" tone="warning" />
          <Badge label="Recorrência" tone="purple" />
          <Badge label="Classificação pendente" tone="orange" />
        </div>
      </Section>

      <Section title="Severidade">
        <div className="ov-panel flex flex-wrap gap-2">
          <Badge label="Information" tone="info" />
          <Badge label="Warning" tone="warning" />
          <Badge label="Average" tone="orange" />
          <Badge label="High" tone="danger" />
          <Badge label="Disaster" tone="disaster" />
        </div>
      </Section>

      <Section title="Do / Don't">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="ov-panel">
            <p className="text-[13px] font-semibold text-[var(--ov-success)]">
              DO
            </p>
            <p className="mt-2 text-[14px] text-[var(--ov-text-secondary)]">
              Superfície neutra + badge no canto. Soft bg, borda e dot 6px.
            </p>
            <div className="mt-4 rounded-[var(--ov-radius-panel)] border border-[var(--ov-border)] bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="ov-title text-[14px]">INT0007</span>
                <Badge label="Retrabalho" tone="danger" />
              </div>
            </div>
          </div>
          <div className="ov-panel">
            <p className="text-[13px] font-semibold text-[var(--ov-danger)]">
              DON&apos;T
            </p>
            <p className="mt-2 text-[14px] text-[var(--ov-text-secondary)]">
              Não pintar o card inteiro com a cor do status. Sem gradient /
              sombra pesada.
            </p>
            <div className="mt-4 rounded-[var(--ov-radius-panel)] bg-[var(--ov-danger)] p-4 text-white shadow-lg">
              INT0007 — card todo vermelho
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

export function UiKitPage() {
  const [tab, setTab] = useState<TabId>("foundations");
  const body = useMemo(() => {
    switch (tab) {
      case "foundations":
        return <Foundations />;
      case "patterns":
        return <Patterns />;
      case "components":
        return <Components />;
      case "templates":
        return <Templates />;
      case "semantic":
        return <SemanticStates />;
      default:
        return null;
    }
  }, [tab]);

  return (
    <div className="ov-kit flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6 px-5 py-6">
        <div
          className="rounded-[var(--ov-radius-control)] border px-4 py-3 text-[13px]"
          style={{
            background: "var(--ov-accent-soft)",
            borderColor: "var(--ov-accent-border)",
            color: "var(--ov-text)",
          }}
        >
          <span className="font-semibold" style={{ color: "var(--ov-accent)" }}>
            INTERNALIZAÇÃO UI KIT v1.1 IS FROZEN
          </span>
          <span className="ml-2 text-[var(--ov-text-secondary)]">
            Novas telas devem reutilizar estes tokens e patterns. Sem sombra em
            panel; primary preto; accent blue só em nav/seleção.
          </span>
        </div>

        <header className="flex flex-col gap-2">
          <h1 className="ov-title ov-title-underscore text-[20px]">
            Internalização UI Kit v1.1
          </h1>
          <p className="text-[14px] text-[var(--ov-text-secondary)]">
            Foundations, patterns e componentes operacionais alinhados ao
            OneView — adaptados ao board de internalização.
          </p>
        </header>

        <nav className="flex flex-wrap gap-2">
          {TABS.map((item) => {
            const active = item.id === tab;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className="rounded-[var(--ov-radius-pill)] border px-3 py-1.5 text-[12px] font-semibold tracking-wide transition-colors"
                style={
                  active
                    ? {
                        background: "var(--ov-surface)",
                        borderColor: "var(--ov-border-strong)",
                        color: "var(--ov-text)",
                      }
                    : {
                        background: "transparent",
                        borderColor: "transparent",
                        color: "var(--ov-text-muted)",
                      }
                }
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {body}
      </div>
    </div>
  );
}
