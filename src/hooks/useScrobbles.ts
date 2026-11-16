"use client";

import { useEffect } from "react";
import { useStore } from "../store/useStore";
import type { Scrobble, Status } from "../types";
import { useHydrated } from "./useHydrated";

// array vazio estável: uma constante, para não invalidar useMemo
// a jusante em cada render antes de haver dados
const VAZIO: Scrobble[] = [];

/** Histórico completo de audições, com carregamento automático. */
export function useScrobbles(): {
  data: Scrobble[];
  status: Status;
  error: string | null;
  recarregar: () => void;
} {
  const hidratado = useHydrated();
  const entrada = useStore((estado) => estado.scrobbles);
  const carregar = useStore((estado) => estado.carregarScrobbles);
  const recarregar = useStore((estado) => estado.recarregarScrobbles);

  // só dispara quando: a cache já foi lida E ainda não há dados
  useEffect(() => {
    if (hidratado && entrada.status === "idle") {
      void carregar();
    }
  }, [hidratado, entrada.status, carregar]);

  return {
    data: entrada.data ?? VAZIO,
    status: entrada.status,
    error: entrada.error,
    recarregar,
  };
}
