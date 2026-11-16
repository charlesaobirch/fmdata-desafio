interface EstadoCarregarProps {
  /** Altura de um esqueleto único (classe Tailwind), p.ex. para gráficos. */
  altura?: string;
  /** Número de linhas, quando o conteúdo é uma lista. */
  linhas?: number;
}

const LARGURAS = ["w-3/4", "w-1/2", "w-2/3", "w-5/6", "w-3/5"];

/**
 * Esqueleto a ocupar o lugar do conteúdo enquanto os dados chegam.
 * Decorativo: o anúncio para leitores de ecrã é um só, por página
 * (AnuncioHistorico).
 */
export function EstadoCarregar({ altura, linhas = 3 }: EstadoCarregarProps) {
  return (
    <div aria-hidden="true" className="flex flex-col gap-2.5">
      {altura ? (
        <span
          className={`${altura} w-full rounded-lg bg-foreground/10 motion-safe:animate-pulse`}
        />
      ) : (
        LARGURAS.slice(0, linhas).map((largura) => (
          <span
            key={largura}
            className={`h-4 ${largura} rounded bg-foreground/10 motion-safe:animate-pulse`}
          />
        ))
      )}
    </div>
  );
}
