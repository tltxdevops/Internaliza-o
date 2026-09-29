"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode, type SVGProps } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  AREA_LABEL,
  FIN_VIEW_SLUG,
  OPS_TRACKS,
  OPS_VIEW_SLUG,
  type Area,
} from "@/domain/status-machine";
import { logout } from "@/lib/auth-client";
import { memberHomePath, type Viewer } from "@/lib/viewer";

const RAIL_W = "4.25rem";
const OPEN_W = "18rem";

const links = [
  { href: "/", label: "Board central", icon: BoardIcon },
  { href: "/areas/comercial", label: AREA_LABEL.comercial, icon: BriefcaseIcon },
  {
    href: "/areas/arquitetura",
    label: AREA_LABEL.arquitetura,
    icon: BlueprintIcon,
  },
  {
    href: "/areas/internalizacao",
    label: AREA_LABEL.internalizacao,
    icon: LayersIcon,
  },
  { href: `/areas/${OPS_VIEW_SLUG}`, label: "Operações", icon: GearIcon },
  { href: `/areas/${FIN_VIEW_SLUG}`, label: AREA_LABEL.financas, icon: CoinIcon },
  { href: "/cadastros", label: "Cadastros", icon: CatalogIcon },
  { href: "/usuarios", label: "Usuários", icon: CatalogIcon },
  { href: "/ui-kit", label: "UI Kit", icon: CatalogIcon },
];

function isActive(pathname: string, href: string) {
  const path = href.split("?")[0] ?? href;
  if (path === "/") {
    return pathname === "/";
  }
  if (path === `/areas/${OPS_VIEW_SLUG}`) {
    if (pathname === path || pathname.startsWith(`${path}/`)) {
      return true;
    }
    return OPS_TRACKS.some(
      (track) =>
        pathname === `/areas/${track}` ||
        pathname.startsWith(`/areas/${track}/`),
    );
  }
  if (path === `/areas/${FIN_VIEW_SLUG}`) {
    return (
      pathname === path ||
      pathname.startsWith(`${path}/`) ||
      pathname === "/areas/supply" ||
      pathname.startsWith("/areas/supply/")
    );
  }
  return pathname === path || pathname.startsWith(`${path}/`);
}

function iconForArea(area: Area) {
  if (area === "comercial") return BriefcaseIcon;
  if (area === "arquitetura") return BlueprintIcon;
  if (area === "internalizacao") return LayersIcon;
  if (area === "financas" || area === "supply") return CoinIcon;
  return GearIcon;
}

function linksFor(viewer: Viewer) {
  if (viewer.role === "admin") {
    return links;
  }
  return [
    {
      href: memberHomePath(viewer.area),
      label: AREA_LABEL[viewer.area],
      icon: iconForArea(viewer.area),
    },
  ];
}

export function AppShell({
  children,
  viewer,
}: {
  children: ReactNode;
  viewer: Viewer;
}) {
  const pathname = usePathname();
  const [hovered, setHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const expanded = hovered;

  const sidebar = (mode: "desktop" | "mobile") => {
    const showLabels = mode === "mobile" || expanded;
    return (
      <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
        <div className="relative flex h-14 shrink-0 items-center overflow-hidden">
          <Link
            href="/"
            title="Internalização"
            className="absolute inset-y-0 left-0 flex w-[4.25rem] items-center justify-center"
          >
            <span className="block h-7 w-7 overflow-hidden">
              <Image
                src="/teletex-logo.png?v=full"
                alt=""
                width={2244}
                height={557}
                className="h-7 w-auto max-w-none"
                priority
                unoptimized
              />
            </span>
            <span className="sr-only">Internalização</span>
          </Link>
          <span
            className={`pointer-events-none truncate pl-[4.25rem] pr-3 text-sm font-semibold tracking-tight text-white transition-opacity duration-200 ${
              showLabels ? "opacity-100" : "opacity-0"
            }`}
          >
            Internalização
          </span>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden pb-2">
          {linksFor(viewer).map((link) => {
            const active = isActive(pathname, link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                title={link.label}
                className={`relative flex h-10 w-full min-w-0 items-center overflow-hidden text-sm transition-colors ${
                  active
                    ? "bg-zinc-100 text-zinc-950"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <span className="absolute inset-y-0 left-0 flex w-[4.25rem] items-center justify-center">
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                </span>
                <span
                  className={`truncate pl-[4.25rem] pr-3 transition-opacity duration-200 ${
                    showLabels ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto shrink-0 border-t border-zinc-800/80">
          <div className={showLabels ? "px-3 py-3" : "flex h-8 items-center justify-center"}>
            {showLabels ? (
              <div className="flex flex-col gap-2">
                <p className="truncate text-xs text-zinc-300" title={viewer.email}>
                  {viewer.name || viewer.email}
                </p>
                <p className="text-[11px] text-zinc-500">
                  {viewer.role === "admin" ? "Admin" : AREA_LABEL[viewer.area]}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    void logout();
                  }}
                  className="text-left text-xs text-zinc-400 underline-offset-2 hover:text-white hover:underline"
                >
                  Sair
                </button>
              </div>
            ) : (
              <span className="text-[10px] font-semibold tracking-wide text-zinc-500">
                {viewer.role === "admin" ? "ADM" : "MBR"}
              </span>
            )}
          </div>
          <div className="relative flex h-14 shrink-0 items-center">
          <div className="absolute inset-y-0 left-0 flex w-[4.25rem] items-center justify-center">
            {mode === "desktop" ? (
              <ThemeToggle variant="onDark" />
            ) : (
              <span className="text-xs text-zinc-500">Menu</span>
            )}
          </div>
        </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative h-full min-h-0 w-full bg-zinc-100 dark:bg-zinc-900">
      {/* Rail spacer — conteúdo não pula; sidebar sobrepõe ao expandir */}
      <div
        className="pointer-events-none hidden md:block"
        style={{ width: RAIL_W }}
        aria-hidden
      />

      <aside
        className="fixed inset-y-0 left-0 z-40 hidden flex-col overflow-hidden border-r border-zinc-800 bg-zinc-950 text-zinc-100 shadow-xl transition-[width] duration-200 ease-out md:flex"
        style={{ width: expanded ? OPEN_W : RAIL_W }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {sidebar("desktop")}
      </aside>

      <button
        type="button"
        aria-label="Fechar menu"
        className={`fixed inset-0 z-30 bg-black/50 transition-opacity duration-300 ease-in-out md:hidden ${
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileOpen(false)}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-zinc-800 bg-zinc-950 text-zinc-100 transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebar("mobile")}
      </aside>

      <div
        className="flex h-full min-h-0 min-w-0 flex-col md:pl-[4.25rem]"
      >
        <header className="flex shrink-0 items-center justify-between gap-2 border-b border-zinc-200 bg-white px-4 py-2.5 md:hidden dark:border-zinc-800 dark:bg-zinc-950">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <MenuIcon />
          </button>
          <span className="text-sm font-semibold">Internalização</span>
          <ThemeToggle />
        </header>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}

function iconProps(props: SVGProps<SVGSVGElement>) {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };
}

function BoardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)}>
      <rect x="3" y="4" width="7" height="16" rx="1" />
      <rect x="14" y="4" width="7" height="10" rx="1" />
    </svg>
  );
}

function BriefcaseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function BlueprintIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </svg>
  );
}

function LayersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)}>
      <path d="m12 2 9 5-9 5-9-5 9-5Z" />
      <path d="m3 12 9 5 9-5" />
      <path d="m3 17 9 5 9-5" />
    </svg>
  );
}

function GearIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1" />
    </svg>
  );
}

function CoinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)}>
      <ellipse cx="12" cy="6" rx="8" ry="3" />
      <path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6" />
      <path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" />
    </svg>
  );
}

function CatalogIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...iconProps(props)}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
      <path d="M8 7h8M8 11h8" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg {...iconProps({ className: "h-5 w-5" })}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
