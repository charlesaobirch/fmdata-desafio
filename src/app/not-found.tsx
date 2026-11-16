import type { Metadata } from "next";
import Link from "next/link";
import { BOTAO_PRIMARIO } from "@/components/ui/estilos";

export const metadata: Metadata = {
  title: "Página não encontrada — fmdata",
};

/**
 * 404 global: URLs sem rota e qualquer notFound() da app. Com um só
 * layout raiz, este ficheiro chega (não é preciso global-not-found).
 */
export default function NaoEncontrado() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-start gap-4 p-8 py-20">
      <h1 className="text-3xl font-semibold tracking-tight">
        Página não encontrada
      </h1>
      <p className="max-w-prose text-pretty text-foreground/70">
        Este endereço não corresponde a nenhuma página do fmdata. Pode ter sido
        escrito à mão com um erro, ou a página mudou de sítio.
      </p>
      <Link href="/" className={BOTAO_PRIMARIO}>
        Voltar ao dashboard
      </Link>
    </main>
  );
}
