import type { ReactNode } from "react";

interface FaixaEntradaProps {
  /** O título; com `principal`, é o <h1> da página. */
  titulo: ReactNode;
  subtitulo?: ReactNode;
  /** A ação da faixa (um link): à direita no desktop, por baixo no telemóvel. */
  acao?: ReactNode;
  /**
   * Sem `principal`, a faixa é navegação (a página tem o seu próprio h1
   * mais abaixo): título pequeno, sem competir com ele.
   */
  principal?: boolean;
}

/**
 * A faixa de entrada das duas páginas: título, subtítulo e uma ação,
 * sobre o fundo com gradiente (sem cartão). Igual nas duas páginas para
 * se reconhecer o mesmo produto.
 */
export function FaixaEntrada({
  titulo,
  subtitulo,
  acao,
  principal = false,
}: FaixaEntradaProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
      <div className="flex min-w-0 flex-col gap-2">
        {principal ? (
          <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            {titulo}
          </h1>
        ) : (
          <p className="text-sm font-semibold tracking-tight">{titulo}</p>
        )}
        {subtitulo}
      </div>
      {acao && <div className="shrink-0">{acao}</div>}
    </header>
  );
}

/** O estilo da ação da faixa: pílula com contorno rosa, texto no tom acessível. */
export const ACAO_FAIXA =
  "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium text-destaque-texto ring-1 ring-destaque ring-inset transition-colors duration-150 hover:bg-destaque/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";
