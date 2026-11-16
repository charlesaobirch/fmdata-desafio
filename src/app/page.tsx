import { GeneroMaisOuvido } from "@/components/dashboard/GeneroMaisOuvido";
import { Grafico24h } from "@/components/dashboard/Grafico24h";
import { NotaPeriodos } from "@/components/dashboard/NotaPeriodos";
import { TopAlbuns } from "@/components/dashboard/TopAlbuns";
import { TopArtistas } from "@/components/dashboard/TopArtistas";
import { TopMusicas } from "@/components/dashboard/TopMusicas";
import { Totais } from "@/components/dashboard/Totais";
import { Descobertas } from "@/components/descobertas/Descobertas";
import { AvisoHistorico } from "@/components/ui/AvisoHistorico";

/**
 * Dashboard. Server Component: os blocos são Client Components e cada
 * um escolhe o seu período; as Descobertas, por baixo, são sempre
 * sobre o histórico completo.
 */
export default function PaginaDashboard() {
  return (
    <main className="flex min-h-screen flex-col gap-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 p-8">
        <section className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold">
            fmdata — o teu histórico em números
          </h1>

          <NotaPeriodos />
        </section>

        {/* só aparece se o histórico falhar: um aviso por todos os blocos */}
        <AvisoHistorico />

        <div className="grid gap-4 md:grid-cols-3">
          {/* alturas equilibradas: o top 20 (alto) acompanha as músicas
              e, por baixo delas, o gráfico 24h e o género lado a lado */}
          <Totais className="md:col-span-3" />
          <TopArtistas className="md:row-span-2" />
          <TopMusicas className="md:col-span-2" />
          <Grafico24h />
          <GeneroMaisOuvido />
          <TopAlbuns className="md:col-span-3" />
        </div>
      </div>

      {/* a toda a largura: a faixa editorial sai da coluna do dashboard */}
      <Descobertas />
    </main>
  );
}
