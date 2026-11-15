"use client";

import { useEffect, useState } from "react";
import { useStore } from "../store/useStore";

let reidratacaoEmCurso: Promise<void> | null = null;

/** Reidrata a store UMA vez, mesmo que vários hooks/components a usem. */
function reidratarUmaVez(): Promise<void> {
  if (!reidratacaoEmCurso) {
    reidratacaoEmCurso = Promise.resolve(useStore.persist.rehydrate()).then(
      () => undefined,
    );
  }
  return reidratacaoEmCurso;
}

/**
 * true quando a store persistida já foi lida do localStorage.
 * Antes disso, nenhum componente deve disparar pedidos.
 */
export function useHydrated(): boolean {
  const [hidratado, setHidratado] = useState(false);

  useEffect(() => {
    let ativo = true;
    void reidratarUmaVez().then(() => {
      if (ativo) setHidratado(true);
    });
    return () => {
      ativo = false;
    };
  }, []);

  return hidratado;
}
