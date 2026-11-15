"use client";

import {
  type ContagemDeArtista,
  type ContagemDeFaixa,
  primeiraEUltimaDoDia,
} from "@/lib/analise";
import { CartaoDescoberta } from "./CartaoDescoberta";
import { formatarNumero } from "./formatar";
import { useDescoberta } from "./useDescoberta";

const TOP = 3;

function Coluna({
  titulo,
  artistas,
  faixa,
}: {
  titulo: string;
  artistas: ContagemDeArtista[];
  faixa: ContagemDeFaixa | null;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-sm font-semibold">{titulo}</h4>
      <ol className="flex flex-col gap-1 text-sm">
        {artistas.slice(0, TOP).map((a) => (
          <li key={a.artista} className="flex justify-between gap-3">
            <span>{a.artista}</span>
            <span className="tabular-nums text-foreground/70">
              {formatarNumero(a.dias)} dias
            </span>
          </li>
        ))}
      </ol>
      {faixa && (
        <p className="text-sm text-foreground/70">
          Música mais repetida:{" "}
          <span className="font-medium text-foreground">{faixa.faixa}</span>,{" "}
          {faixa.artista} ({formatarNumero(faixa.dias)} dias)
        </p>
      )}
    </div>
  );
}

export function CartaoAberturaFecho() {
  const { resultado: dia } = useDescoberta(primeiraEUltimaDoDia);

  return (
    <CartaoDescoberta
      pergunta="Com que música começas e acabas o dia?"
      titulo={dia ? "Sabes acordar. Dormir, nem por isso." : undefined}
      subtitulo={
        dia ? "a primeira do dia repete-se, a última nunca" : undefined
      }
      nota={
        dia &&
        `Em ${formatarNumero(dia.diasComMusica)} dias com música, a primeira e a última audição de cada dia (UTC).`
      }
    >
      {dia && (
        <div className="grid gap-5 sm:grid-cols-2">
          <Coluna
            titulo="Abre o dia"
            artistas={dia.quemAbre}
            faixa={dia.faixaQueMaisAbre}
          />
          <Coluna
            titulo="Fecha o dia"
            artistas={dia.quemFecha}
            faixa={dia.faixaQueMaisFecha}
          />
        </div>
      )}
    </CartaoDescoberta>
  );
}
