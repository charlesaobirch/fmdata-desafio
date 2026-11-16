import type { Status } from "@/types";

/** Os quatro estados que qualquer bloco de dados mostra. */
export type EstadoDoBloco = "loading" | "erro" | "vazio" | "sucesso";

/**
 * Traduz o status da store para o estado do bloco.
 * idle e loading → esqueleto; error e not-found → erro com "tentar de
 * novo"; success sem nada para mostrar → vazio.
 */
export function estadoDe(status: Status, vazio: boolean): EstadoDoBloco {
  if (status === "idle" || status === "loading") return "loading";
  if (status === "error" || status === "not-found") return "erro";
  return vazio ? "vazio" : "sucesso";
}
