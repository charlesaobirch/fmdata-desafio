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

/** Link para a página de um artista: o estilo de link que já existia nos tops. */
export const LINK_ARTISTA =
  "rounded decoration-destaque decoration-2 underline-offset-4 transition-colors duration-150 hover:text-destaque-texto hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";

/**
 * O mesmo link sobre uma capa: branco sobre a sobreposição escura (o rosa
 * não se leria), sublinhado e contorno de foco brancos.
 */
export const LINK_ARTISTA_SOBRE_IMAGEM =
  "rounded decoration-white underline-offset-2 transition-colors duration-150 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
