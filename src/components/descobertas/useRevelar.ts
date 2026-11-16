"use client";

import { useEffect, useRef, useState } from "react";

type Revelar = "visivel" | "pendente";

/**
 * Esconde um painel até entrar no ecrã, uma só vez. Começa visível
 * (sem JavaScript, ou já à vista, nada fica escondido); só um painel
 * ainda abaixo do ecrã passa a "pendente". O CSS só o anima com
 * prefers-reduced-motion: no-preference.
 */
export function useRevelar<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [revelar, setRevelar] = useState<Revelar>("visivel");

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    setRevelar("pendente");
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setRevelar("visivel");
          observador.disconnect();
        }
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    observador.observe(el);
    return () => observador.disconnect();
  }, []);

  return { ref, revelar };
}
