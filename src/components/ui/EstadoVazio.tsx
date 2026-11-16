import { MusicNotesIcon } from "@solar-icons/react/linear/music-notes";

interface EstadoVazioProps {
  mensagem?: string;
}

/** Os dados chegaram mas não há nada para mostrar neste período. */
export function EstadoVazio({
  mensagem = "Sem audições neste período. Escolhe um período maior no topo do bloco.",
}: EstadoVazioProps) {
  return (
    <p className="flex gap-2 text-pretty text-sm text-foreground/70">
      <MusicNotesIcon className="mt-0.5 size-4 shrink-0" />
      <span>{mensagem}</span>
    </p>
  );
}
