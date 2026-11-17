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

/**
 * Os mesmos artistas, pela mesma ordem, a abrir e a fechar o dia? Só
 * então o subtítulo os nomeia: com outros dados a frase seria falsa.
 */
function mesmosNasDuasPontas(
  abrem: ContagemDeArtista[],
  fecham: ContagemDeArtista[],
): string[] | null {
  const a = abrem.slice(0, TOP).map((x) => x.artista);
  const f = fecham.slice(0, TOP).map((x) => x.artista);
  return a.length > 0 && a.length === f.length && a.every((n, i) => n === f[i])
    ? a
    : null;
}

/** "Adele, Tove Lo e Jão", cada nome com link para o artista. */
function listaDeArtistas(nomes: string[]) {
  return nomes.map((nome, i) => (
    <span key={nome}>
      {i > 0 && (i === nomes.length - 1 ? " e " : ", ")}
      <LinkArtista nome={nome} />
    </span>
  ));
}

export function CartaoAberturaFecho() {
  const { resultado: dia, cartao } = useDescoberta(primeiraEUltimaDoDia);
  const mesmos = dia ? mesmosNasDuasPontas(dia.quemAbre, dia.quemFecha) : null;
  // o ponto rosa do painel: os dias da faixa que mais se repete numa das
  // pontas do dia; em empate, nenhuma coluna se destaca
  const abre = dia?.faixaQueMaisAbre?.dias ?? 0;
  const fecha = dia?.faixaQueMaisFecha?.dias ?? 0;
  const vence = abre > fecha ? "abre" : fecha > abre ? "fecha" : null;

  return (
    <PainelDescoberta
      {...cartao}
      pergunta="Com que música começas e acabas o dia?"
      titulo={dia ? "Quem abre o teu dia também o fecha." : undefined}
      subtitulo={
        mesmos ? (
          <>{listaDeArtistas(mesmos)}, pela mesma ordem, de manhã e à noite.</>
        ) : undefined
      }
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
