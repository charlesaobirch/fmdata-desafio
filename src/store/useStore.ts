import { create } from "zustand";
import { persist } from "zustand/middleware";
import { normalizarNome } from "../lib/filters";
import {
  mensagemDeErro,
  NaoEncontradoError,
  obterAlbumInfo,
  obterArtistInfo,
  obterScrobbles,
} from "../services/api";
import type {
  AlbumInfo,
  ArtistInfo,
  Entry,
  Periodo,
  Scrobble,
  Status,
} from "../types";

function entradaVazia<T>(): Entry<T> {
  return { data: null, status: "idle", error: null, updatedAt: null };
}

/**
 * Deduplicação: registo de pedidos em curso, FORA da store.
 * Dois pedidos iguais em simultâneo partilham a mesma promessa.
 */
const pedidosEmCurso = new Map<string, Promise<void>>();

interface StoreState {
  periodo: Periodo;
  scrobbles: Entry<Scrobble[]>;
  // chave: nome do artista normalizado
  artistas: Record<string, Entry<ArtistInfo>>;
  // chave: artista::álbum, ambos normalizados
  albuns: Record<string, Entry<AlbumInfo>>;

  setPeriodo: (periodo: Periodo) => void;
  carregarScrobbles: () => Promise<void>;
  recarregarScrobbles: () => void;
  carregarArtista: (nome: string) => Promise<void>;
  carregarAlbum: (artista: string, album: string) => Promise<void>;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      periodo: "tudo",
      scrobbles: entradaVazia<Scrobble[]>(),
      artistas: {},
      albuns: {},

      setPeriodo: (periodo) => set({ periodo }),

      carregarScrobbles: async () => {
        const atual = get().scrobbles;
        if (atual.status === "success" && atual.data) return;

        const CHAVE = "scrobbles";
        const emCurso = pedidosEmCurso.get(CHAVE);
        if (emCurso) return emCurso;

        const promessa = (async () => {
          set({
            scrobbles: {
              data: null,
              status: "loading",
              error: null,
              updatedAt: null,
            },
          });
          try {
            const dados = await obterScrobbles();
            set({
              scrobbles: {
                data: dados,
                status: "success",
                error: null,
                updatedAt: Date.now(),
              },
            });
          } catch (erro) {
            set({
              scrobbles: {
                data: null,
                status: "error",
                error: mensagemDeErro(erro),
                updatedAt: null,
              },
            });
          } finally {
            pedidosEmCurso.delete(CHAVE);
          }
        })();

        pedidosEmCurso.set(CHAVE, promessa);
        return promessa;
      },

      recarregarScrobbles: () => {
        // força novo pedido: limpa a cache e dispara
        set({ scrobbles: entradaVazia<Scrobble[]>() });
        void get().carregarScrobbles();
      },

      carregarArtista: async (nome) => {
        const chave = normalizarNome(nome);
        const atual = get().artistas[chave];
        if (atual && atual.status === "success" && atual.data) return;

        const CHAVE = `artista::${chave}`;
        const emCurso = pedidosEmCurso.get(CHAVE);
        if (emCurso) return emCurso;

        const promessa = (async () => {
          set((estado) => ({
            artistas: {
              ...estado.artistas,
              [chave]: {
                data: null,
                status: "loading",
                error: null,
                updatedAt: null,
              },
            },
          }));
          try {
            const dados = await obterArtistInfo(nome);
            set((estado) => ({
              artistas: {
                ...estado.artistas,
                [chave]: {
                  data: dados,
                  status: "success",
                  error: null,
                  updatedAt: Date.now(),
                },
              },
            }));
          } catch (erro) {
            // 404 é "não existe" (estado próprio), não falha técnica
            const notFound = erro instanceof NaoEncontradoError;
            const status: Status = notFound ? "not-found" : "error";
            set((estado) => ({
              artistas: {
                ...estado.artistas,
                [chave]: {
                  data: null,
                  status,
                  error: notFound ? null : mensagemDeErro(erro),
                  updatedAt: null,
                },
              },
            }));
          } finally {
            pedidosEmCurso.delete(CHAVE);
          }
        })();

        pedidosEmCurso.set(CHAVE, promessa);
        return promessa;
      },

      carregarAlbum: async (artista, album) => {
        const chave = `${normalizarNome(artista)}::${normalizarNome(album)}`;
        const atual = get().albuns[chave];
        if (atual && atual.status === "success" && atual.data) return;

        const CHAVE = `album::${chave}`;
        const emCurso = pedidosEmCurso.get(CHAVE);
        if (emCurso) return emCurso;

        const promessa = (async () => {
          set((estado) => ({
            albuns: {
              ...estado.albuns,
              [chave]: {
                data: null,
                status: "loading",
                error: null,
                updatedAt: null,
              },
            },
          }));
          try {
            const dados = await obterAlbumInfo(artista, album);
            set((estado) => ({
              albuns: {
                ...estado.albuns,
                [chave]: {
                  data: dados,
                  status: "success",
                  error: null,
                  updatedAt: Date.now(),
                },
              },
            }));
          } catch (erro) {
            const notFound = erro instanceof NaoEncontradoError;
            const status: Status = notFound ? "not-found" : "error";
            set((estado) => ({
              albuns: {
                ...estado.albuns,
                [chave]: {
                  data: null,
                  status,
                  error: notFound ? null : mensagemDeErro(erro),
                  updatedAt: null,
                },
              },
            }));
          } finally {
            pedidosEmCurso.delete(CHAVE);
          }
        })();

        pedidosEmCurso.set(CHAVE, promessa);
        return promessa;
      },
    }),

    /* ---------- persistência ---------- */
    {
      name: "fmdata-cache",
      version: 1,
      skipHydration: true, // reidratação manual no cliente (useHydrated)
      // só o que interessa: periodo e os dados. Nunca o "status" —
      // um "loading" persistido deixaria a página presa a carregar.
      partialize: (estado) => ({
        periodo: estado.periodo,
        scrobbles: serializarEntry(estado.scrobbles),
        artistas: serializarMapa(estado.artistas),
        albuns: serializarMapa(estado.albuns),
      }),
    },
  ),
);

/* ---------- helpers da persistência ---------- */

interface EntrySerializada<T> {
  data: T | null;
  status: Status;
  error: string | null;
  updatedAt: number | null;
}

/** Com dados volta sempre como "success"; sem dados fica "idle". */
function serializarEntry<T>(entrada: Entry<T>): EntrySerializada<T> {
  return {
    data: entrada.data,
    status: entrada.data ? "success" : "idle",
    error: null,
    updatedAt: entrada.updatedAt,
  };
}

function serializarMapa<T>(
  mapa: Record<string, Entry<T>>,
): Record<string, EntrySerializada<T>> {
  const resultado: Record<string, EntrySerializada<T>> = {};
  for (const [chave, entrada] of Object.entries(mapa)) {
    resultado[chave] = serializarEntry(entrada);
  }
  return resultado;
}
