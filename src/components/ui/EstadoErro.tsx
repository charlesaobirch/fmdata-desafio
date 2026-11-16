import { DangerTriangleIcon } from "@solar-icons/react/linear/danger-triangle";
import { BOTAO_PRIMARIO } from "./estilos";

interface EstadoErroProps {
  /** O que falhou, em linguagem do utilizador. */
  mensagem?: string;
  /** Mensagem técnica (já amigável) vinda da camada de pedidos. */
  detalhe?: string | null;
  aoRepetir?: () => void;
}

/** O pedido falhou: diz o que aconteceu e oferece tentar de novo. */
export function EstadoErro({
  mensagem = "Não conseguimos carregar o teu histórico.",
  detalhe,
  aoRepetir,
}: EstadoErroProps) {
  return (
    <div role="alert" className="flex flex-col items-start gap-3 text-sm">
      <p className="flex gap-2">
        {/* o ícone reforça, não substitui: a mensagem diz o que falhou */}
        <DangerTriangleIcon className="mt-0.5 size-4 shrink-0" />
        <span>
          {mensagem}
          {detalhe && (
            <span className="block text-foreground/70">Detalhe: {detalhe}</span>
          )}
        </span>
      </p>
      {aoRepetir && (
        <button type="button" onClick={aoRepetir} className={BOTAO_PRIMARIO}>
          Tentar de novo
        </button>
      )}
    </div>
  );
}
