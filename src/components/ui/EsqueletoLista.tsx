interface EsqueletoListaProps {
  linhas: number;
  /** Miniatura redonda (artistas) ou quadrada (capas). */
  redondo?: boolean;
}

/** Esqueleto com a forma de uma lista de ranking: miniatura e texto. */
export function EsqueletoLista({
  linhas,
  redondo = false,
}: EsqueletoListaProps) {
  return (
    <div className="flex flex-col gap-3">
      <output className="sr-only">A carregar o teu histórico…</output>
      {Array.from({ length: linhas }, (_, i) => (
        // lista fixa e sem estado: o índice serve de chave
        // biome-ignore lint/suspicious/noArrayIndexKey: ver acima
        <div key={i} className="flex items-center gap-3">
          <span
            className={`size-10 shrink-0 bg-foreground/10 motion-safe:animate-pulse ${
              redondo ? "rounded-full" : "rounded-lg"
            }`}
          />
          <span className="h-4 w-2/3 rounded bg-foreground/10 motion-safe:animate-pulse" />
        </div>
      ))}
    </div>
  );
}
