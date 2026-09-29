"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  PRIORIDADE_LABEL,
  PRIORIDADES,
  STATUS_INTERNALIZACAO,
  TIPOS_DEMANDA,
  TIPO_DEMANDA_LABEL,
  isTipoDemanda,
  motivoCorrecaoLabel,
  prioridadeNeedsJustification,
  showGpAndLider,
  type LookupOption,
} from "@/domain/demand-fields";
import {
  AREA_LABEL,
  adjustmentRequestsForViewer,
  type Area,
} from "@/domain/status-machine";
import type { DemandCardModel } from "@/lib/demand-board";
import type { FormLookups } from "@/lib/catalog";

export const demandInputClass =
  "h-8 w-full rounded-md border border-zinc-300 bg-white px-2.5 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100";

function MultiSelectDropdown({
  name,
  label,
  options,
  selected,
  onChange,
}: {
  name: string;
  label: string;
  options: LookupOption[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const available = options.filter((option) => !selected.includes(option.value));
  const labelOf = (value: string) =>
    options.find((option) => option.value === value)?.label ?? value;

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {label}
      </span>
      <div className="flex min-h-8 flex-wrap items-center gap-1.5 rounded-md border border-zinc-300 bg-white px-2 py-1.5 dark:border-zinc-600 dark:bg-zinc-950">
        {selected.map((value) => (
          <span
            key={value}
            className="inline-flex max-w-full items-center gap-1 rounded-md bg-zinc-900 px-2 py-0.5 text-[12px] font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            <span className="truncate">{labelOf(value)}</span>
            <button
              type="button"
              aria-label={`Remover ${labelOf(value)}`}
              className="text-zinc-300 hover:text-white dark:text-zinc-500 dark:hover:text-zinc-900"
              onClick={() =>
                onChange(selected.filter((item) => item !== value))
              }
            >
              ×
            </button>
            <input type="hidden" name={name} value={value} />
          </span>
        ))}
        <select
          className="h-7 min-w-[7.5rem] flex-1 border-0 bg-transparent px-1 text-sm text-zinc-700 outline-none dark:text-zinc-200"
          value=""
          onChange={(event) => {
            const value = event.target.value;
            if (!value) {
              return;
            }
            onChange([...selected, value]);
          }}
        >
          <option value="">
            {selected.length === 0 ? "Selecionar…" : "Adicionar…"}
          </option>
          {available.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex min-w-0 flex-col gap-1 ${className}`}>
      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {label}
        {hint ? (
          <span className="ml-1 font-normal text-zinc-400">· {hint}</span>
        ) : null}
      </span>
      {children}
    </label>
  );
}

export function DemandFormFields({
  demand,
  area,
  lookups,
}: {
  demand?: DemandCardModel;
  area: Area;
  lookups: FormLookups;
}) {
  const [prioridade, setPrioridade] = useState(
    demand ? demand.prioridade || "normal" : "",
  );
  const [servicos, setServicos] = useState(demand?.servicosContemplados ?? []);
  const [saSes, setSaSes] = useState(demand?.saSesArquitetura ?? []);
  const [bus, setBus] = useState(demand?.busArquitetura ?? []);

  useEffect(() => {
    setPrioridade(demand ? demand.prioridade || "normal" : "");
    setServicos(demand?.servicosContemplados ?? []);
    setSaSes(demand?.saSesArquitetura ?? []);
    setBus(demand?.busArquitetura ?? []);
  }, [demand?.id]);

  const showOpsPeople = showGpAndLider(area, servicos);
  const adjustmentRequests = demand
    ? adjustmentRequestsForViewer(demand.works, area)
    : [];
  const showRetrabalhoPanel =
    adjustmentRequests.length > 0 ||
    Boolean(demand?.retrabalhoMarcado && demand.descricaoAjuste);

  return (
    <>
      <input type="hidden" name="formArea" value={area} />

      <div className="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2">
        <Field label="Cliente" hint="obrigatório">
          <input
            name="cliente"
            required
            defaultValue={demand?.cliente || demand?.title || ""}
            className={demandInputClass}
          />
        </Field>

        <Field label="Tipo de demanda">
          <select
            name="tipoDemanda"
            required
            defaultValue={
              demand && isTipoDemanda(demand.tipoDemanda)
                ? demand.tipoDemanda
                : ""
            }
            className={demandInputClass}
          >
            <option value="" disabled>
              Selecione
            </option>
            {TIPOS_DEMANDA.map((tipo) => (
              <option key={tipo} value={tipo}>
                {TIPO_DEMANDA_LABEL[tipo]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Nome da oportunidade">
          <input
            name="nomeOportunidade"
            defaultValue={demand?.nomeOportunidade ?? ""}
            className={demandInputClass}
          />
        </Field>

        <Field label="Código Protheus">
          <input
            name="codigoProtheus"
            defaultValue={demand?.codigoProtheus ?? ""}
            className={demandInputClass}
          />
        </Field>

        <Field label="Prioridade">
          <select
            name="prioridade"
            required
            value={prioridade}
            onChange={(event) => setPrioridade(event.target.value)}
            className={demandInputClass}
          >
            <option value="" disabled>
              Selecione
            </option>
            {PRIORIDADES.map((item) => (
              <option key={item} value={item}>
                {PRIORIDADE_LABEL[item]}
              </option>
            ))}
          </select>
        </Field>

        {prioridadeNeedsJustification(prioridade) ? (
          <Field
            label="Justificativa da prioridade"
            hint="Alta/Crítica"
            className="sm:col-span-2"
          >
            <textarea
              name="prioridadeJustificativa"
              required
              rows={2}
              defaultValue={demand?.prioridadeJustificativa ?? ""}
              className={`${demandInputClass} h-auto min-h-[2.5rem] py-1.5`}
            />
          </Field>
        ) : null}

        <div>
          <MultiSelectDropdown
            name="servicosContemplados"
            label="Serviços contemplados"
            options={lookups.servicos}
            selected={servicos}
            onChange={setServicos}
          />
        </div>

        <div>
          <MultiSelectDropdown
            name="saSesArquitetura"
            label="SA/SEs Arquitetura"
            options={lookups.saSes}
            selected={saSes}
            onChange={setSaSes}
          />
        </div>

        <div>
          <MultiSelectDropdown
            name="busArquitetura"
            label="BUs Arquitetura"
            options={lookups.bus}
            selected={bus}
            onChange={setBus}
          />
        </div>

        <Field label="Responsável" hint="e-mail">
          <input
            name="responsavelEmail"
            type="email"
            defaultValue={demand?.responsavelEmail ?? ""}
            placeholder="nome@empresa.com"
            className={demandInputClass}
          />
        </Field>

        <Field label="Account Manager" hint="e-mail">
          <input
            name="accountManagerEmail"
            type="email"
            defaultValue={demand?.accountManagerEmail ?? ""}
            placeholder="nome@empresa.com"
            className={demandInputClass}
          />
        </Field>

        <Field label="Internalização">
          <input
            type="hidden"
            name="internalizadoAtual"
            value={demand?.internalizado ? "1" : "0"}
          />
          <select
            name="statusInternalizacao"
            defaultValue={
              demand?.statusInternalizacao ||
              (demand?.internalizado ? "internalizado" : "")
            }
            className={demandInputClass}
          >
            <option value="">Selecione</option>
            {STATUS_INTERNALIZACAO.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </Field>

        {showOpsPeople ? (
          <>
            <Field label="Gerente de Projetos" hint="PrimeDeploy">
              <input
                name="gerenteProjetosEmail"
                type="email"
                required
                defaultValue={demand?.gerenteProjetosEmail ?? ""}
                placeholder="nome@empresa.com"
                className={demandInputClass}
              />
            </Field>
            <Field label="Líder Técnico" hint="PrimeDeploy">
              <input
                name="liderTecnicoEmail"
                type="email"
                required
                defaultValue={demand?.liderTecnicoEmail ?? ""}
                placeholder="nome@empresa.com"
                className={demandInputClass}
              />
            </Field>
          </>
        ) : (
          <>
            <input
              type="hidden"
              name="gerenteProjetosEmail"
              value={demand?.gerenteProjetosEmail ?? ""}
            />
            <input
              type="hidden"
              name="liderTecnicoEmail"
              value={demand?.liderTecnicoEmail ?? ""}
            />
          </>
        )}

        {showRetrabalhoPanel ? (
          <div className="col-span-full flex flex-col gap-2 rounded-lg border border-[#d92d20]/40 bg-[#d92d20]/5 px-3 py-2">
            <p className="text-xs font-semibold text-[#d92d20]">
              Pedido de ajustes / Retrabalho
            </p>
            {adjustmentRequests.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {adjustmentRequests.map((request) => (
                  <div
                    key={`${request.from}-${request.justificativa}`}
                    className="rounded-md border border-zinc-200 bg-white px-2.5 py-2 text-xs dark:border-zinc-700 dark:bg-zinc-950"
                  >
                    <p>
                      <span className="text-zinc-500">Por:</span>{" "}
                      {AREA_LABEL[request.from]}
                      <span className="mx-1 text-zinc-300">·</span>
                      <span className="text-zinc-500">Para:</span>{" "}
                      {request.para.map((item) => AREA_LABEL[item]).join(", ") ||
                        "—"}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
                      {request.justificativa || "—"}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-700 dark:text-zinc-300">
                {(demand?.motivoCorrecao ?? []).map(motivoCorrecaoLabel).join(", ") ||
                  "—"}
                {" · "}
                {demand?.descricaoAjuste || "—"}
              </p>
            )}
            <input type="hidden" name="retrabalhoMarcado" value="1" />
            {(demand?.motivoCorrecao ?? []).map((motivo) => (
              <input
                key={motivo}
                type="hidden"
                name="motivoCorrecao"
                value={motivo}
              />
            ))}
            <input
              type="hidden"
              name="descricaoAjuste"
              value={demand?.descricaoAjuste ?? ""}
            />
          </div>
        ) : demand ? (
          <>
            <input type="hidden" name="retrabalhoMarcado" value="" />
            <input type="hidden" name="descricaoAjuste" value="" />
          </>
        ) : null}
      </div>
    </>
  );
}
