"use client";

import { useCallback, useEffect } from "react";
import { normalizarNome } from "../lib/filters";
import { useStore } from "../store/useStore";
import type { ArtistInfo, Status } from "../types";
import { useHydrated } from "./useHydrated";

/**
 * Perfil de um artista, com cache por nome (normalizado).
 * 404 -> status "not-found" (página própria);
 * rede/500 -> status "error" (botão "tentar de novo", via recarregar).
 */
export function useArtistInfo(nome: string): {
  data: ArtistInfo | null;
  status: Status;
  error: string | null;
  recarregar: () => void;
} {
  const hidratado = useHydrated();
  const chave = normalizarNome(nome);
  const entrada = useStore((estado) => estado.artistas[chave]);
  const carregar = useStore((estado) => estado.carregarArtista);

  useEffect(() => {
    // dispara quando não há entrada alguma, ou está "idle"
    if (hidratado && (!entrada || entrada.status === "idle")) {
      void carregar(nome);
    }
  }, [hidratado, entrada, carregar, nome]);

  // "tentar de novo": carregarArtista volta a pedir sempre que a
  // entrada não está em success (é o caso de "error")
  const recarregar = useCallback(() => {
    void carregar(nome);
  }, [carregar, nome]);

  return {
    data: entrada?.data ?? null,
    status: entrada?.status ?? "idle",
    error: entrada?.error ?? null,
    recarregar,
  };
}
