/** O botão principal da app ("Tentar de novo", "Voltar ao dashboard"): o estilo vive num só sítio. */
export const BOTAO_PRIMARIO =
  "rounded-full bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-colors duration-150 hover:bg-foreground/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

/**
 * O número de posição num ranking. A 1.ª fica a rosa: é o ponto de
 * destaque do bloco, o mesmo em todos os rankings.
 */
export const classePosicao = (i: number) =>
  `w-5 shrink-0 text-right text-sm tabular-nums ${
    i === 0 ? "font-semibold text-destaque-texto" : "text-foreground/60"
  }`;
