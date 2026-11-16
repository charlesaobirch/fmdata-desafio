/**
 * O histórico não chegou: o AvisoHistorico, no topo, explica uma vez.
 * Aqui fica só o lugar do conteúdo, quieto: barras paradas e mais
 * ténues que o esqueleto (que pulsa), para não parecer que carrega.
 */
export function EstadoSemHistorico() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-2.5">
      <span className="h-4 w-3/4 rounded bg-foreground/5" />
      <span className="h-4 w-1/2 rounded bg-foreground/5" />
    </div>
  );
}
