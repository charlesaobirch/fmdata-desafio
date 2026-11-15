"use client";

import { maiorSequenciaRepetida } from "@/lib/analise";
import { CartaoDescoberta } from "./CartaoDescoberta";
import { useDescoberta } from "./useDescoberta";

// acima disto a fila de marcas deixa de caber e deixa de se ler
const MARCAS_MAX = 60;

export function CartaoMaratona() {
  const { resultado, cartao } = useDescoberta(maiorSequenciaRepetida);

  return (
    <CartaoDescoberta
      {...cartao}
      pergunta="Qual foi a música que ouviste mais vezes seguidas?"
      titulo={resultado ? `${resultado.vezes} vezes seguidas, amor` : undefined}
      subtitulo={
        resultado ? `${resultado.faixa}, duas horas sem parar` : undefined
      }
    >
      {resultado && (
        <div className="flex flex-col gap-3">
          {/* uma marca por repetição: a quantidade vê-se antes de se ler */}
          <div aria-hidden="true" className="flex flex-wrap gap-1">
            {Array.from(
              { length: Math.min(resultado.vezes, MARCAS_MAX) },
              (_, i) => (
                <span
                  // posições fixas: a lista nunca é reordenada
                  // biome-ignore lint/suspicious/noArrayIndexKey: marcas idênticas
                  key={i}
                  className="h-6 w-1.5 rounded-full bg-foreground/80"
                />
              ),
            )}
          </div>
          <p className="text-sm text-foreground/70">
            <span className="font-medium text-foreground">
              {resultado.faixa}
            </span>{" "}
            · {resultado.artista}
          </p>
        </div>
      )}
    </CartaoDescoberta>
  );
}
