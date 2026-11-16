interface EstadoVazioProps {
  mensagem?: string;
}

/** Os dados chegaram mas não há nada para mostrar neste período. */
export function EstadoVazio({
  mensagem = "Sem audições neste período. Experimenta um período maior.",
}: EstadoVazioProps) {
  return <p className="text-pretty text-sm text-foreground/70">{mensagem}</p>;
}
