"use client";

import { LinkArtista } from "@/components/artista/LinkArtista";
import {
  type ContagemDeArtista,
  type ContagemDeFaixa,
  primeiraEUltimaDoDia,
} from "@/lib/analise";
import { contar } from "./formatar";
import { PainelDescoberta } from "./PainelDescoberta";
import { useDescoberta } from "./useDescoberta";

const TOP = 3;

function Coluna({
  titulo,
  artistas,
  faixa,
  destacar,
}: {
  titulo: string;
  artistas: ContagemDeArtista[];
  faixa: ContagemDeFaixa | null;
  /** A coluna que sustenta o título: os dias da sua faixa ficam a rosa. */
  destacar: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-sm font-semibold">{titulo}</h4>
      <ol className="flex flex-col gap-1 text-sm">
        {artistas.slice(0, TOP).map((a) => (
          <li key={a.artista} className="flex justify-between gap-3">
            <span>
              <LinkArtista nome={a.artista} />
            </span>
            <span className="tabular-nums text-foreground/70">
              {contar(a.dias, "dia", "dias")}
            </span>
          </li>
        ))}
      </ol>
      {faixa && (
        <p className="text-sm text-foreground/70">
          Música mais repetida:{" "}
          <span className="font-medium text-foreground">{faixa.faixa}</span>,{" "}
          <LinkArtista nome={faixa.artista} /> (
          <span
            className={destacar ? "font-medium text-destaque-texto" : undefined}
          >
            {contar(faixa.dias, "dia", "dias")}
          </span>
          )
        </p>
      )}
    </div>
  );
}

const vezes = (n: number) => contar(n, "vez", "vezes");

/**
 * Só afirma contraste quando os números são mesmo diferentes; com a
 * mesma contagem, uma frase neutra no mesmo tom.
 */
function frasesDoDia(
  abre: number | undefined,
  fecha: number | undefined,
): { titulo: string; subtitulo?: string } {
  if (abre === undefined || fecha === undefined) {
    return { titulo: "Cada dia começa e acaba à sua maneira." };
  }
  if (abre > fecha) {
    return {
      titulo: "Sabes acordar. Dormir, nem por isso.",
      subtitulo: `a primeira do dia repete-se ${vezes(abre)}, a última só ${vezes(fecha)}`,
    };
  }
  if (fecha > abre) {
    return {
      titulo: "Sabes adormecer. Acordar, nem por isso.",
      subtitulo: `a última do dia repete-se ${vezes(fecha)}, a primeira só ${vezes(abre)}`,
    };
  }
  return {
    titulo: "Começas e acabas o dia com a mesma teimosia.",
    subtitulo: `a primeira e a última do dia repetem-se ${vezes(abre)} cada`,
  };
}

export function CartaoAberturaFecho() {
  const { resultado: dia, cartao } = useDescoberta(primeiraEUltimaDoDia);
  const frases = dia
    ? frasesDoDia(dia.faixaQueMaisAbre?.dias, dia.faixaQueMaisFecha?.dias)
    : null;
  // o ponto rosa do painel: a coluna cujo número sustenta o título;
  // em empate o título é neutro e nenhuma coluna se destaca
  const abre = dia?.faixaQueMaisAbre?.dias ?? 0;
  const fecha = dia?.faixaQueMaisFecha?.dias ?? 0;
  const vence = abre > fecha ? "abre" : fecha > abre ? "fecha" : null;

  return (
    <PainelDescoberta
      {...cartao}
      pergunta="Com que música começas e acabas o dia?"
      titulo={frases?.titulo}
      subtitulo={frases?.subtitulo}
      nota={
        dia &&
        `Em ${contar(dia.diasComMusica, "dia", "dias")} com música, a primeira e a última audição de cada dia (UTC).`
      }
    >
      {dia && (
        <div className="grid gap-5 sm:grid-cols-2">
          <Coluna
            titulo="Abre o dia"
            artistas={dia.quemAbre}
            faixa={dia.faixaQueMaisAbre}
            destacar={vence === "abre"}
          />
          <Coluna
            titulo="Fecha o dia"
            artistas={dia.quemFecha}
            faixa={dia.faixaQueMaisFecha}
            destacar={vence === "fecha"}
          />
        </div>
      )}
    </PainelDescoberta>
  );
}
