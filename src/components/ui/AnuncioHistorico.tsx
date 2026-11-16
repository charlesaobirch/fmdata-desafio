"use client";

import { useHydrated } from "@/hooks/useHydrated";
import { useScrobbles } from "@/hooks/useScrobbles";

/**
 * O único anúncio de carregamento para leitores de ecrã (os esqueletos
 * dos blocos são decorativos). A região nasce vazia e só ganha texto
 * depois de montar: o que já lá está no primeiro render nem sempre é
 * anunciado. Em erro fica calada: quem fala é o AvisoHistorico.
 */
export function AnuncioHistorico() {
  const { status } = useScrobbles();
  const montado = useHydrated();
  const aCarregar = status === "idle" || status === "loading";

  return (
    <output className="sr-only">
      {montado && aCarregar ? "A carregar o teu histórico…" : ""}
    </output>
  );
}
