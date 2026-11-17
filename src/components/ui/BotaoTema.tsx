"use client";

import { MoonStarsIcon } from "@solar-icons/react/linear/moon-stars";
import { SunIcon } from "@solar-icons/react/linear/sun";
import { useEffect, useState } from "react";

type Tema = "claro" | "escuro";

const CHAVE = "fmdata-tema";

/**
 * O botão de tema. Sem escolha guardada, a página segue o esquema do
 * sistema (o CSS decide); ao clicar, o esquema fica forçado no <html>
 * (data-tema) e guardado — a próxima visita abre logo nele.
 *
 * O <html> recebe o data-tema guardado num script inline no layout,
 * antes da primeira pintura: sem isto, a página piscava o esquema
 * errado até o React montar.
 *
 * O 1.º render (servidor e cliente) não consulta o matchMedia: tem de
 * ser igual nos dois, ou o React reporta erro de hidratação quando o
 * tema guardado difere da preferência do sistema. O efeito corrige o
 * ícone logo a seguir à montagem.
 */
export function BotaoTema() {
  // null = a seguir o sistema (sem escolha guardada)
  const [tema, setTema] = useState<Tema | null>(null);

  useEffect(() => {
    const atual = document.documentElement.dataset.tema;
    if (atual === "claro" || atual === "escuro") setTema(atual);
  }, []);

  const aoAlternar = () => {
    // decide pelo estado vivo do <html>, não pelo state do React
    const atual = document.documentElement.dataset.tema;
    const escuroAtual =
      atual === "escuro" ||
      (!atual && window.matchMedia("(prefers-color-scheme: dark)").matches);
    const novo: Tema = escuroAtual ? "claro" : "escuro";
    document.documentElement.dataset.tema = novo;
    try {
      localStorage.setItem(CHAVE, novo);
    } catch {
      // sem persistência (modo privado): a escolha vale só esta sessão
    }
    setTema(novo);
  };

  return (
    <button
      type="button"
      onClick={aoAlternar}
      aria-label={
        tema === "escuro"
          ? "Mudar para o modo claro"
          : "Mudar para o modo escuro"
      }
      aria-pressed={tema !== null}
      className="inline-flex size-9 items-center justify-center rounded-full text-foreground/70 ring-1 ring-foreground/20 ring-inset transition-colors duration-150 hover:bg-foreground/5 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
    >
      {/* no escuro mostra o sol (vai para o claro) e vice-versa; até o
          efeito correr, mostra a lua — o ponto de partida do sistema */}
      {tema === "escuro" ? <SunIcon /> : <MoonStarsIcon />}
    </button>
  );
}
