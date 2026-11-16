"use client";

import { RoutingIcon } from "@solar-icons/react/linear/routing";
import { useState } from "react";
import { useScrobbles } from "@/hooks/useScrobbles";

/**
 * O aviso único quando o histórico não chega: em vez de uma mensagem
 * igual em cada bloco, uma só no topo, com um só "Tentar de novo" que
 * recarrega tudo (os blocos partilham a mesma entrada da store).
 *
 * Fica visível enquanto se tenta outra vez e só some quando os dados
 * chegam; se voltar a falhar, continua lá. O tom é o das Descobertas:
 * leve, sem jargão e sem culpar ninguém.
 */
export function AvisoHistorico() {
  const { status, recarregar } = useScrobbles();
  const [tentou, setTentou] = useState(false);

  const aTentar = tentou && status === "loading";
  if (status !== "error" && !aTentar) return null;

  return (
    <div
      role="alert"
      aria-busy={aTentar}
      className="entrada flex flex-col gap-4 rounded-2xl border border-foreground/15 bg-foreground/[0.04] p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
    >
      <div className="flex gap-3">
        <RoutingIcon className="mt-0.5 size-5 shrink-0" />
        <div className="flex flex-col gap-1">
          <p className="text-pretty font-semibold">
            As tuas audições ficaram presas no trânsito.
          </p>
          <p className="max-w-prose text-pretty text-sm text-foreground/75">
            A ligação falhou antes de o histórico chegar, por isso os números
            estão em branco. Quando quiseres, tentamos outra vez.
          </p>
        </div>
      </div>
      <button
        type="button"
        disabled={aTentar}
        onClick={() => {
          setTentou(true);
          recarregar();
        }}
        className="shrink-0 self-start rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-colors duration-150 hover:bg-foreground/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground disabled:cursor-wait disabled:opacity-60 sm:self-center"
      >
        {aTentar ? "A tentar…" : "Tentar de novo"}
      </button>
    </div>
  );
}
