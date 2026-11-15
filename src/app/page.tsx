"use client";

import { useFiltrados } from "@/hooks/useFiltrados";
import { usePeriodo } from "@/hooks/usePeriodo";
import type { Periodo } from "@/types";

const PERIODOS: { valor: Periodo; rotulo: string }[] = [
  { valor: "tudo", rotulo: "Tudo" },
  { valor: "30d", rotulo: "30 dias" },
  { valor: "14d", rotulo: "14 dias" },
  { valor: "7d", rotulo: "7 dias" },
  { valor: "24h", rotulo: "24 horas" },
];

/**
 * Página mínima de verificação da fundação (etapa 6).
 * Mostra a contagem de scrobbles filtrados pelo período;
 * na fase da UI é substituída pelo dashboard completo.
 */
export default function PaginaVerificacao() {
  const { periodo, setPeriodo } = usePeriodo();
  const { scrobbles, status, error, recarregar } = useFiltrados();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-8">
      <h1 className="text-xl font-semibold">Verificação da fundação</h1>

      <div className="flex flex-wrap gap-2">
        {PERIODOS.map((p) => (
          <button
            key={p.valor}
            type="button"
            onClick={() => setPeriodo(p.valor)}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              periodo === p.valor
                ? "bg-foreground text-background"
                : "bg-black/5 dark:bg-white/6"
            }`}
          >
            {p.rotulo}
          </button>
        ))}
      </div>

      {status === "loading" && <p>A carregar scrobbles…</p>}

      {status === "error" && (
        <div>
          <p className="text-red-500">{error}</p>
          <button type="button" onClick={recarregar} className="mt-2 underline">
            Tentar de novo
          </button>
        </div>
      )}

      {status === "success" && (
        <p className="text-3xl font-bold">{scrobbles.length} audições</p>
      )}
    </main>
  );
}
