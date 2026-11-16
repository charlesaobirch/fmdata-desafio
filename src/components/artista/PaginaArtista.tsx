"use client";

import { ArrowLeftIcon } from "@solar-icons/react/linear/arrow-left";
import Link from "next/link";
import { type ReactNode, useEffect } from "react";
import { AnuncioHistorico } from "@/components/ui/AnuncioHistorico";
import { AvisoHistorico } from "@/components/ui/AvisoHistorico";
import { EstadoCarregar } from "@/components/ui/EstadoCarregar";
import { EstadoSemHistorico } from "@/components/ui/EstadoSemHistorico";
import { BOTAO_PRIMARIO } from "@/components/ui/estilos";
import { useScrobblesDoArtista } from "@/hooks/useScrobblesDoArtista";
import type { Scrobble } from "@/types";
import { ArtistasSemelhantes } from "./ArtistasSemelhantes";
import { CabecalhoArtista } from "./CabecalhoArtista";
import { EstatisticasArtista } from "./EstatisticasArtista";
import { RelogioArtista } from "./RelogioArtista";
import { ScrobblesPorMes } from "./ScrobblesPorMes";
import { TopMusicasArtista } from "./TopMusicasArtista";
import { UltimasAudicoes } from "./UltimasAudicoes";

const FOCO =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

function Moldura({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-10 p-8">
      <Link
        href="/"
        className={`inline-flex w-fit items-center gap-1.5 rounded text-sm text-foreground/70 transition-colors duration-150 hover:text-foreground ${FOCO}`}
      >
        <ArrowLeftIcon />
        Dashboard
      </Link>
      {/* só aparece se o histórico falhar, e fica enquanto se tenta outra vez */}
      <AvisoHistorico />
      <AnuncioHistorico />
      {children}
    </main>
  );
}

function EsqueletoPagina() {
  return (
    <div aria-busy="true" className="flex flex-col gap-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
        <span className="size-40 shrink-0 rounded-2xl bg-foreground/10 motion-safe:animate-pulse" />
        <div className="flex w-full flex-col gap-3">
          <span className="h-9 w-2/3 rounded bg-foreground/10 motion-safe:animate-pulse" />
          <EstadoCarregar linhas={2} />
        </div>
      </div>
      <EstadoCarregar altura="h-28" />
    </div>
  );
}

/** A página inteira a carregar (também serve de fallback do Suspense). */
export function EsqueletoArtista() {
  return (
    <Moldura>
      <EsqueletoPagina />
    </Moldura>
  );
}

function ArtistaNaoEncontrado({ nome }: { nome: string }) {
  return (
    <section className="flex flex-col items-start gap-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">
        Artista não encontrado
      </h1>
      <p className="max-w-prose text-pretty text-foreground/70">
        {nome ? (
          <>
            <span className="font-medium text-foreground">«{nome}»</span> não
            aparece no teu histórico de audições.
          </>
        ) : (
          "O endereço não indica nenhum artista."
        )}{" "}
        Confirma o nome ou escolhe um artista a partir do dashboard.
      </p>
      <Link href="/" className={BOTAO_PRIMARIO}>
        Voltar ao dashboard
      </Link>
    </section>
  );
}

interface ConteudoProps {
  /** Só audições com data: a base das contas, como no dashboard. */
  doArtista: Scrobble[];
  comData: Scrobble[];
  /** O histórico completo: "ouvido" nos semelhantes = a página existe. */
  todos: Scrobble[];
  /**
   * O nome como está nos dados ("Os Barões Da Pisadinha"), não como
   * veio no URL ("os baroes da pisadinha"): é o que a API reconhece.
   */
  nomeCanonico: string;
}

function ConteudoArtista({
  doArtista,
  comData,
  todos,
  nomeCanonico,
}: ConteudoProps) {
  // o servidor só conhece o nome do URL ("os baroes da pisadinha"); o
  // canónico vem dos dados, por isso o separador acerta-se aqui
  useEffect(() => {
    document.title = `${nomeCanonico} — fmdata`;
  }, [nomeCanonico]);

  return (
    <>
      <CabecalhoArtista nome={nomeCanonico} />
      <div className="grid gap-4 md:grid-cols-3">
        <EstatisticasArtista
          className="md:col-span-3"
          doArtista={doArtista}
          todos={comData}
        />
        <TopMusicasArtista className="md:col-span-2" doArtista={doArtista} />
        <UltimasAudicoes doArtista={doArtista} />
        <ScrobblesPorMes className="md:col-span-3" doArtista={doArtista} />
        <RelogioArtista className="md:col-span-2" doArtista={doArtista} />
        <ArtistasSemelhantes nome={nomeCanonico} todos={todos} />
      </div>
    </>
  );
}

/**
 * Página do artista (guia, 8.2): resolve os quatro estados antes de
 * qualquer bloco. "Não encontrado" = o artista não está nos teus
 * dados; os blocos só montam quando ele existe.
 */
export function PaginaArtista({ nome }: { nome: string }) {
  // sempre o histórico completo: a página do artista ignora o período
  const { doArtista, comData, todos, existe, nomeCanonico, status } =
    useScrobblesDoArtista(nome);

  if (status === "idle" || status === "loading") return <EsqueletoArtista />;

  if (status === "error" || status === "not-found") {
    return (
      <Moldura>
        <section className="flex flex-col items-start gap-4 py-12">
          <h1 className="text-3xl font-semibold tracking-tight">
            {nome || "Artista"}
          </h1>
          <EstadoSemHistorico />
        </section>
      </Moldura>
    );
  }

  // "não encontrado" só se não aparece de todo: um artista só com
  // audições sem data abre, com os blocos vazios
  if (!nome || !existe || !nomeCanonico) {
    return (
      <Moldura>
        <ArtistaNaoEncontrado nome={nome} />
      </Moldura>
    );
  }

  return (
    <Moldura>
      {/* key: ao saltar para um semelhante, os blocos começam do zero
          (p.ex. a bio volta a fechada) em vez de herdar estado */}
      <ConteudoArtista
        key={nomeCanonico}
        doArtista={doArtista}
        comData={comData}
        todos={todos}
        nomeCanonico={nomeCanonico}
      />
    </Moldura>
  );
}
