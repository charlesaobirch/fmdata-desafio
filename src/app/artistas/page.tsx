/**
 * Página temporária do índice de artistas.
 * A navegação real para artistas faz-se pelos links do dashboard
 * (top 20) e pelos artistas semelhantes na página do artista.
 */
export default function PaginaArtistas() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 p-8">
      <h1 className="text-xl font-semibold">Artistas</h1>
      <p>
        Escolhe um artista a partir do dashboard — clica no nome de um artista
        no top 20.
      </p>
    </main>
  );
}
