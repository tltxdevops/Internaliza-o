import type { Metadata } from "next";
import { headers } from "next/headers";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { AppShell } from "@/components/app-nav";
import { readViewer } from "@/lib/read-viewer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Internalização",
  description: "Piloto local do board de internalização",
};

const themeBootScript = `(function(){try{var t=localStorage.getItem("internalizacao-theme");var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.classList.add("dark");}catch(e){}})();`;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const finishingLogin = (await headers()).get("x-sso-pending") === "1";
  const publicPage =
    finishingLogin ||
    pathname === "/login" ||
    pathname.startsWith("/sem-acesso") ||
    pathname.startsWith("/auth");
  const viewer = publicPage ? null : await readViewer();
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full overflow-hidden">
        <Script
          id="theme-boot"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeBootScript }}
        />
        {viewer ? <AppShell viewer={viewer}>{children}</AppShell> : children}
      </body>
    </html>
  );
}
