import { JetBrains_Mono, Lato } from "next/font/google";
import type { ReactNode } from "react";
import "./ui-kit.css";

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-ov-mono",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-ov-sans",
});

export default function UiKitLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${jetbrains.variable} ${lato.variable} h-full min-h-0`}>
      {children}
    </div>
  );
}
