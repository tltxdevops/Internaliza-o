"use client";

import { useState } from "react";
import { startMicrosoftLogin } from "@/lib/auth-client";

export function SsoLoginButton() {
  const [error, setError] = useState("");

  return (
    <div className="mt-6">
      {error ? <p className="mb-3 text-sm text-red-200">{error}</p> : null}
      <button
        type="button"
        className="inline-flex w-full items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-medium text-zinc-950"
        onClick={() => {
          setError("");
          void startMicrosoftLogin().catch(() => {
            setError("Não foi possível abrir a Microsoft.");
          });
        }}
      >
        Entrar com Microsoft
      </button>
    </div>
  );
}
