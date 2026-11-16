"use client";

import { SquareArrowRightUpIcon } from "@solar-icons/react/linear/square-arrow-right-up";
import { useState } from "react";
import { formatarNumero } from "@/components/descobertas/formatar";
import { Capa } from "@/components/ui/Capa";
import { EstadoCarregar } from "@/components/ui/EstadoCarregar";
import { EstadoErro } from "@/components/ui/EstadoErro";
import { useArtistInfo } from "@/hooks/useArtistInfo";
import { separarLista } from "@/lib/filters";
import type { ArtistInfo } from "@/types";

/**
 * A bio chega em texto com parágrafos separados por linha em branco.
 * Não se usa dangerouslySetInnerHTML: se vier algum HTML (o "Read
 * more on Last.fm" da Last.fm), tira-se a marcação e fica o texto.
 */
function paragrafos(texto: string): string[] {
  return texto
    .replace(/<a\b[^>]*>\s*Read more on Last\.fm\s*<\/a>\.?/gi, "")
    .replace(/<[^>]*>/g, "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

function Biografia({ info }: { info: ArtistInfo }) {
  const [aberta, setAberta] = useState(false);
  const resumo = paragrafos(info.bio_summary);
  const completa = paragrafos(info.bio_content);
  // o resumo é o início da completa: só há "ler mais" se houver mais
  const temMais = completa.join(" ").length > resumo.join(" ").length;
  const visiveis = aberta || resumo.length === 0 ? completa : resumo;

  if (visiveis.length === 0) return null;

  return (
    <div className="flex max-w-prose flex-col items-start gap-3 text-sm/relaxed text-foreground/80">
      {visiveis.map((p) => (
        <p key={p} className="text-pretty">
          {p}
        </p>
      ))}
      {temMais && (
        <button
          type="button"
          aria-expanded={aberta}
          onClick={() => setAberta((a) => !a)}
          className="rounded font-medium text-foreground underline underline-offset-4 transition-colors duration-150 hover:text-foreground/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          {aberta ? "Ler menos" : "Ler mais"}
        </button>
      )}
    </div>
  );
}

/** Last.fm sempre; Wikipedia e MusicBrainz só quando a API os tem. */
function Ligacoes({ info }: { info: ArtistInfo }) {
  const ligacoes = [
    { rotulo: "Last.fm", url: info.url_lastfm },
    { rotulo: "Wikipedia", url: info.url_wikipedia },
    { rotulo: "MusicBrainz", url: info.url_musicbrainz },
  ].filter((l): l is { rotulo: string; url: string } => !!l.url);

  if (ligacoes.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
      {ligacoes.map((l) => (
        <li key={l.rotulo}>
          <a
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded font-medium underline-offset-4 transition-colors duration-150 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            {l.rotulo}
            <SquareArrowRightUpIcon className="text-foreground/60" />
            <span className="sr-only"> (abre noutro separador)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/**
 * Bloco 1 da página do artista: foto, nome, tags, ligações e bio.
 * O nome vem dos dados (existe sempre); o resto vem do perfil da API
 * e degrada se faltar: um 404 aqui não apaga as audições do artista.
 */
export function CabecalhoArtista({ nome }: { nome: string }) {
  const { data: info, status, error, recarregar } = useArtistInfo(nome);
  // sem repetidos: são a chave da lista
  const tags = info ? [...new Set(separarLista(info.tags))] : [];

  return (
    <header className="flex flex-col gap-6">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
        <div
          className={`relative size-40 shrink-0 overflow-hidden rounded-2xl ${
            status === "loading" || status === "idle"
              ? "bg-foreground/10 motion-safe:animate-pulse"
              : ""
          }`}
        >
          {status !== "loading" && status !== "idle" && (
            <Capa
              src={info?.image_url}
              alt={`Fotografia de ${nome}`}
              nome={nome}
              sizes="160px"
              carregarJa
            />
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <h1 className="text-balance text-4xl font-semibold tracking-tight">
            {nome}
          </h1>

          {(status === "loading" || status === "idle") && (
            <EstadoCarregar linhas={2} />
          )}

          {status === "not-found" && (
            <p className="text-sm text-foreground/70">
              A Last.fm não tem perfil deste artista. Os números abaixo vêm do
              teu histórico.
            </p>
          )}

          {status === "error" && (
            <EstadoErro
              mensagem="Não conseguimos carregar o perfil deste artista."
              detalhe={error}
              aoRepetir={recarregar}
            />
          )}

          {info && (
            <>
              {tags.length > 0 && (
                <ul aria-label="Géneros" className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full bg-foreground/5 px-2.5 py-0.5 text-xs capitalize text-foreground/80 dark:bg-white/6"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-sm text-foreground/70">
                <span className="font-medium tabular-nums text-foreground">
                  {formatarNumero(info.listeners_global)}
                </span>{" "}
                ouvintes na Last.fm
              </p>
              <Ligacoes info={info} />
            </>
          )}
        </div>
      </div>

      {info && <Biografia info={info} />}
    </header>
  );
}
