"use client";

import { useEffect } from "react";
import { normalizarNome } from "../lib/filters";
import { useStore } from "../store/useStore";
import type { AlbumInfo, Status } from "../types";
import { useHydrated } from "./useHydrated";

/**
 * Perfil de um álbum (sobretudo track_count, para "Ouviste X de Y").
 * Opcional: se falhar, a interface degrada com elegância
 * (mostra só "X faixas ouvidas") em vez de partir.
 */
export function useAlbumInfo(
  artista: string,
  album: string,
): {
  data: AlbumInfo | null;
  status: Status;
  error: string | null;
} {
  const hidratado = useHydrated();
  const chave = `${normalizarNome(artista)}::${normalizarNome(album)}`;
  const entrada = useStore((estado) => estado.albuns[chave]);
  const carregar = useStore((estado) => estado.carregarAlbum);

  useEffect(() => {
    if (hidratado && (!entrada || entrada.status === "idle")) {
      void carregar(artista, album);
    }
  }, [hidratado, entrada, carregar, artista, album]);

  return {
    data: entrada?.data ?? null,
    status: entrada?.status ?? "idle",
    error: entrada?.error ?? null,
  };
}
