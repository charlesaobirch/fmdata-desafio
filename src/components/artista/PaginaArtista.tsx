"use client";

import { ArrowLeftIcon } from "@solar-icons/react/linear/arrow-left";
import Link from "next/link";
import { type ReactNode, useMemo } from "react";
import { EstadoCarregar } from "@/components/ui/EstadoCarregar";
import { EstadoErro } from "@/components/ui/EstadoErro";
import { useScrobbles } from "@/hooks/useScrobbles";
import { filtrarPorArtista } from "@/lib/filters";
import type { Scrobble } from "@/types";
import { CabecalhoArtista } from "./CabecalhoArtista";
import { EstatisticasArtista } from "./EstatisticasArtista";

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
      <Link
        href="/"
        className={`rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-colors duration-150 hover:bg-foreground/85 ${FOCO}`}
      >
        Voltar ao dashboard
      </Link>
    </section>
  );
}

interface ConteudoProps {
  doArtista: Scrobble[];
  todos: Scrobble[];
}

function ConteudoArtista({ doArtista, todos }: ConteudoProps) {
  // o nome como está nos dados ("Os Barões Da Pisadinha"), não como
  // veio no URL ("os baroes da pisadinha"): é o que a API reconhece
  const nomeCanonico = doArtista[0].artist_name;

  return (
    <>
      <CabecalhoArtista nome={nomeCanonico} />
      <div className="grid gap-4 md:grid-cols-3">
        <EstatisticasArtista
          className="md:col-span-3"
          doArtista={doArtista}
          todos={todos}
        />
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
  const { data: todos, status, error, recarregar } = useScrobbles();
  // sempre o histórico completo: a página do artista ignora o período
  const doArtista = useMemo(
    () => (nome ? filtrarPorArtista(todos, nome) : []),
    [todos, nome],
  );

  if (status === "idle" || status === "loading") return <EsqueletoArtista />;

  if (status === "error" || status === "not-found") {
    return (
      <Moldura>
        <section className="flex flex-col items-start gap-4 py-12">
          <h1 className="text-3xl font-semibold tracking-tight">
            {nome || "Artista"}
          </h1>
          <EstadoErro detalhe={error} aoRepetir={recarregar} />
        </section>
      </Moldura>
    );
  }

  if (doArtista.length === 0) {
    return (
      <Moldura>
        <ArtistaNaoEncontrado nome={nome} />
      </Moldura>
    );
  }

  return (
    <Moldura>
      <ConteudoArtista doArtista={doArtista} todos={todos} />
    </Moldura>
  );
}
