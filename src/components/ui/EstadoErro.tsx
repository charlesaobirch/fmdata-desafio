interface EstadoErroProps {
  /** Mensagem técnica (já amigável) vinda da camada de pedidos. */
  detalhe?: string | null;
  aoRepetir?: () => void;
}

/** O pedido falhou: diz o que aconteceu e oferece tentar de novo. */
export function EstadoErro({ detalhe, aoRepetir }: EstadoErroProps) {
  return (
    <div role="alert" className="flex flex-col items-start gap-3 text-sm">
      <p>
        Não conseguimos carregar o teu histórico.
        {detalhe && (
          <span className="block text-foreground/70">Detalhe: {detalhe}</span>
        )}
      </p>
      {aoRepetir && (
        <button
          type="button"
          onClick={aoRepetir}
          className="rounded-full bg-foreground px-4 py-1.5 font-medium text-background transition-colors duration-150 hover:bg-foreground/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          Tentar de novo
        </button>
      )}
    </div>
  );
}
