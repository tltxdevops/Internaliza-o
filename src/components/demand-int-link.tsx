"use client";

import Link from "next/link";
import type { ReactNode } from "react";

export function DemandIntLink({
  href,
  children,
  className = "hover:underline",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={className}
      onPointerDown={(event) => event.stopPropagation()}
    >
      {children}
    </Link>
  );
}
