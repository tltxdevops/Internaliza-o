export function statusBadgeClass(status: string) {
  if (status === "em_andamento") {
    return "bg-blue-600 text-white";
  }
  if (status === "aguardando_ajustes") {
    return "bg-orange-500 text-white";
  }
  if (status === "retrabalho") {
    return "bg-red-600 text-white";
  }
  if (status === "concluido") {
    return "bg-emerald-600 text-white";
  }
  return "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-100";
}

export function statusDotClass(status: string) {
  if (status === "em_andamento") {
    return "bg-blue-600";
  }
  if (status === "aguardando_ajustes") {
    return "bg-orange-500";
  }
  if (status === "retrabalho") {
    return "bg-red-600";
  }
  if (status === "concluido") {
    return "bg-emerald-600";
  }
  return "bg-zinc-400";
}

export function StatusBadge({
  status,
  label,
}: {
  status: string;
  label: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusBadgeClass(status)}`}
    >
      {label}
    </span>
  );
}
