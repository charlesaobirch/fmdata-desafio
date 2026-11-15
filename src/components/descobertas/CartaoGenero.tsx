"use client";

import { generoPorFaixaDoDia, MOMENTOS_DO_DIA } from "@/lib/analise";
import { CartaoDescoberta } from "./CartaoDescoberta";
import { formatarIndice } from "./formatar";
import { useDescoberta } from "./useDescoberta";

// quantos géneros acima do habitual mostrar por momento
const ACIMA = 3;

const horas = (de: number, ate: number) => `${de}h–${ate + 1}h`;

export function CartaoGenero() {
  const { resultado: momentos } = useDescoberta(generoPorFaixaDoDia);

  return (
    <CartaoDescoberta
      largo
      pergunta="Que géneros ouves mais a cada momento do dia?"
      titulo={
        momentos
          ? "De manhã és Anitta. De madrugada és uma britânica a chorar."
          : undefined
      }
      subtitulo={
        momentos ? "funk ao pequeno-almoço, baladas às 3 da manhã" : undefined
      }
      nota={
        momentos &&
        "Percentagem = quanto o género pesa nesse momento face ao teu habitual. Só contam géneros com 200 ou mais audições no momento. Horas em UTC."
      }
    >
      {momentos && (
        <ul className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
          {momentos.map((m) => {
            const meta = MOMENTOS_DO_DIA.find((x) => x.momento === m.momento);
            const acima = m.tags.filter((t) => t.indice > 1).slice(0, ACIMA);
            const abaixo = m.tags.at(-1);
            return (
              <li key={m.momento} className="flex flex-col gap-2">
                <p className="text-sm">
                  <span className="font-semibold">{m.rotulo}</span>{" "}
                  {meta && (
                    <span className="tabular-nums text-foreground/70">
                      {horas(meta.de, meta.ate)}
                    </span>
                  )}
                </p>
                {acima.length === 0 ? (
                  <p className="text-sm text-foreground/70">
                    Nenhum género se destaca.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-1 text-sm">
                    {acima.map((t) => (
                      <li key={t.tag} className="flex justify-between gap-3">
                        <span>{t.tag}</span>
                        <span className="font-medium tabular-nums">
                          {formatarIndice(t.indice)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                {abaixo && abaixo.indice < 1 && (
                  <p className="flex justify-between gap-3 text-sm text-foreground/70">
                    <span>{abaixo.tag}</span>
                    <span className="tabular-nums">
                      {formatarIndice(abaixo.indice)}
                    </span>
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </CartaoDescoberta>
  );
}
