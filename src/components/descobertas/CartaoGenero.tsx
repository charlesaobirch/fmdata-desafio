"use client";

import {
  type GeneroDoMomento,
  generoPorFaixaDoDia,
  MOMENTOS_DO_DIA,
} from "@/lib/analise";
import { formatarIndice } from "./formatar";
import { PainelDescoberta } from "./PainelDescoberta";
import { useDescoberta } from "./useDescoberta";

// quantos géneros acima do habitual mostrar por momento
const ACIMA = 3;

// sem nenhum género com amostra suficiente, não há descoberta
const semGenerosDestacados = (momentos: GeneroDoMomento[]) =>
  momentos.every((m) => m.tags.length === 0);

const horas = (de: number, ate: number) => `${de}h–${ate + 1}h`;

export function CartaoGenero() {
  const { resultado: momentos, cartao } = useDescoberta(
    generoPorFaixaDoDia,
    semGenerosDestacados,
  );
  // o maior índice acima do habitual em todo o dia (empate: o 1.º na ordem do dia)
  let maior: { momento: string; tag: string; indice: number } | null = null;
  for (const m of momentos ?? []) {
    for (const t of m.tags.filter((x) => x.indice > 1).slice(0, ACIMA)) {
      if (!maior || t.indice > maior.indice) {
        maior = { momento: m.momento, tag: t.tag, indice: t.indice };
      }
    }
  }

  return (
    <PainelDescoberta
      {...cartao}
      mensagemVazia="Ainda não há audições com géneros suficientes em nenhum momento do dia (são precisas 200 por género)."
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
          {/* o ponto rosa do painel: o maior salto do dia, um só */}
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
                        <span
                          className={`font-medium tabular-nums ${
                            maior?.momento === m.momento && maior.tag === t.tag
                              ? "text-destaque-texto"
                              : ""
                          }`}
                        >
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
    </PainelDescoberta>
  );
}
