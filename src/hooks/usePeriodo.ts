"use client";

import { useShallow } from "zustand/react/shallow";
import { useStore } from "../store/useStore";
import type { Periodo } from "../types";

/** O filtro global do dashboard, partilhado por todos os blocos. */
export function usePeriodo(): {
  periodo: Periodo;
  setPeriodo: (p: Periodo) => void;
} {
  return useStore(
    useShallow((estado) => ({
      periodo: estado.periodo,
      setPeriodo: estado.setPeriodo,
    })),
  );
}
