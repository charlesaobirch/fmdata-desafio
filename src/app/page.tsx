"use client";

import { GeneroMaisOuvido } from "@/components/dashboard/GeneroMaisOuvido";
import { Grafico24h } from "@/components/dashboard/Grafico24h";
import { TopAlbuns } from "@/components/dashboard/TopAlbuns";
import { TopArtistas } from "@/components/dashboard/TopArtistas";
import { Totais } from "@/components/dashboard/Totais";
import { Descobertas } from "@/components/descobertas/Descobertas";
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

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-10 p-8">
      <section className="flex flex-col gap-6">
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
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Totais className="md:col-span-2" />
        <GeneroMaisOuvido />
        <TopArtistas />
        <Grafico24h className="md:col-span-2" />
        <TopAlbuns className="md:col-span-3" />
      </div>

      <Descobertas />
    </main>
  );
}
