"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { completeMicrosoftLogin, restoreSession } from "@/lib/auth-client";

export function SsoReturn({ code, state }: { code?: string; state?: string }) {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        if (code && state) {
          await completeMicrosoftLogin(code, state);
          if (!cancelled) {
            window.location.replace("/");
          }
          return;
        }
        await restoreSession();
      } catch (caught) {
        if (cancelled) {
          return;
        }
        const message = caught instanceof Error ? caught.message : "";
        setError(
          message === "state"
            ? "O retorno da Microsoft não confere com este navegador. Entre de novo."
            : "Não foi possível concluir o login Microsoft.",
        );
        router.replace("/login?erro=microsoft");
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [code, state, router]);

  if (!code) {
    return null;
  }

  return (
    <main className="flex min-h-full items-center justify-center bg-zinc-950 px-4 text-zinc-100">
      <p className="text-sm text-zinc-300">
        {error || "Concluindo o login Microsoft…"}
      </p>
    </main>
  );
}
