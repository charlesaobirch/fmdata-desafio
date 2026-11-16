import type { Metadata } from "next";
import { Suspense } from "react";
import { nomeDoSegmento } from "@/components/artista/caminho";
import {
  EsqueletoArtista,
  PaginaArtista,
} from "@/components/artista/PaginaArtista";

/*
 * Server Component: só lê o segmento e descodifica-o. Os dados vivem
 * na store (cliente), por isso o resto da página é um Client
 * Component. Sempre all-time: o filtro de período não entra aqui.
 *
 * Com cacheComponents, params é dado de runtime: o acesso fica dentro
 * de <Suspense> para a moldura da página continuar pré-renderizável.
 */

export async function generateMetadata({
  params,
}: PageProps<"/artistas/[nome]">): Promise<Metadata> {
  const { nome } = await params;
  return { title: `${nomeDoSegmento(nome)} — fmdata` };
}

export default function Page({ params }: PageProps<"/artistas/[nome]">) {
  return (
    <Suspense fallback={<EsqueletoArtista />}>
      {params.then(({ nome }) => (
        <PaginaArtista nome={nomeDoSegmento(nome)} />
      ))}
    </Suspense>
  );
}
