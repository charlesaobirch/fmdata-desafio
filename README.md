# fmdata

Dashboard e página de artista sobre um histórico de audições do Last.fm (51 522 scrobbles, de 2018 a 2026), com uma análise própria sobre hábitos de escuta.
Next.js 16, React 19, Zustand e Recharts, sobre a [API fmdata](https://fmdata-api.onrender.com).

## Como correr

Requer Node 20.9 ou mais recente.

```bash
npm install
npm run dev          # http://localhost:3000
```

Verificação completa:

```bash
npm run dataset      # descarrega o histórico completo (26 MB) para scrobbles-completo.json, fora do git
npm run verificar    # lint, as quatro suítes de testes, tsc e build
```

> O `npm run verificar` precisa de rede: o `test:completo` compara os resultados com a API (o endpoint oficial do relógio 24h e os perfis de artista). Também precisa do `scrobbles-completo.json`, que o `npm run dataset` descarrega.

## O que está feito

### Dashboard (`/`)

Os oito blocos:

1. **Período**: cada bloco tem o seu seletor (ver as decisões técnicas).
2. **Totais**: audições e artistas distintos.
3. **Top 20 artistas**, com link para a página de cada um.
4. **Top 10 músicas.**
5. **Top 8 álbuns.**
6. **A que horas ouves**: as 24 horas em UTC, com a hora de pico destacada.
7. **Género mais ouvido**, com o top 5 e a percentagem de cada um.
8. **Análise única**: as Descobertas, sempre sobre o histórico completo.

### Página do artista (`/artistas/[nome]`)

- **Cabeçalho**: fotografia, géneros, ligações (Last.fm, Wikipedia, MusicBrainz) e biografia.
- **Em números**: audições, percentagem do total, faixas favoritas, primeira e última audição.
- **Top 10 músicas.**
- **Álbuns**: "Ouviste X de Y faixas", contando só as faixas que estão na tracklist do álbum.
- **Audições por mês**, com os meses sem audições a zero.
- **Relógio 24h.**
- **Últimas 10 audições.**
- **Artistas semelhantes**: só os já ouvidos têm link.

O nome vai codificado no URL e é descodificado à entrada: acentos, barras (K/DA), `&` e espaços funcionam. Um artista inexistente tem a sua própria página, com o caminho de volta.

### Estados

Cada bloco tem quatro estados: a carregar, erro, vazio e sucesso.

- **Falha do histórico:** aparece um único aviso no topo, com um só "Tentar de novo".
- **Falha de um pedido próprio** (o perfil do artista, um álbum): o erro fica nesse bloco.
- **Página inexistente:** há uma página 404 global.

## Decisões técnicas

- **Filtro de período por bloco, em vez de global.** Cada bloco guarda o seu período, por isso dá para comparar, por exemplo, o top de artistas dos últimos 7 dias com os totais de sempre. Para não recalcular por bloco, o filtro é calculado uma vez por período e partilhado (`src/hooks/useFiltradosPor.ts`): os blocos com o mesmo período recebem o mesmo array. Os períodos contam a partir da última audição e não de hoje; com dados antigos, "últimas 24 horas" estaria sempre vazio.
- **Cache que não persiste os scrobbles.** A store (`src/store/useStore.ts`) persiste no `localStorage` os perfis de artista e de álbum, mas não o histórico. O histórico tem 24,7 MB em JSON e o `localStorage` aceita cerca de 5 MB por origem: guardá-lo esgotava a quota, e o erro transformava dados válidos em estado de erro. Por isso o histórico fica em memória, com deduplicação dos pedidos em curso, e o armazenamento é à prova de falhas. Em contrapartida, um refresh volta a pedir o histórico.
- **Tudo em UTC.** A API dá as datas em UTC. Horas, dias e meses agrupam-se com `getUTC*`, e os gráficos indicam-no. Com a hora local, o relógio 24h ficaria desalinhado com o endpoint oficial, e o teste de ouro confirma que não fica.
- **Funções puras em `src/lib`, sem `fetch` nem React.** `dates`, `filters`, `stats`, `artist` e `analise` recebem arrays e devolvem dados. A rede está em `src/services`, o estado em `src/store`, e os componentes só falam com hooks. Cada regra existe uma vez:
  - as datas passam todas por `parseDataScrobble`, por isso a música que está a tocar e as datas inválidas ficam de fora em todas as páginas;
  - os nomes comparam-se com `normalizarNome`, por isso "Beyoncé" e "beyonce" são o mesmo artista.

## A análise única

A pergunta-guia é o que os dados dizem sobre os hábitos de escuta que um filtro de período não mostra. São cinco perguntas, cada uma com uma função pura em [`src/lib/analise.ts`](src/lib/analise.ts) e um painel em [`src/components/descobertas/`](src/components/descobertas/).

| Pergunta | Função | Painel |
|---|---|---|
| Qual foi a música que ouviste mais vezes seguidas? | `maiorSequenciaRepetida` | `CartaoMaratona.tsx` |
| Quem é o artista mais presente no teu dia a dia? | `artistaDeCasa` | `CartaoArtistaDeCasa.tsx` |
| Que géneros ouves mais a cada momento do dia? | `generoPorFaixaDoDia` | `CartaoGenero.tsx` |
| Quanto terão recebido os artistas pelas tuas audições? | `valorEstimado` | `CartaoValor.tsx` |
| Com que música começas e acabas o dia? | `primeiraEUltimaDoDia` | `CartaoAberturaFecho.tsx` |

O valor estimado usa taxas por reprodução que não vêm da API. São uma assunção declarada e estão visíveis no painel.

## Testes

| Comando | Ficheiro | O que cobre | Verificações |
|---|---|---|---|
| `npm run test` | `scripts/teste-lib.ts` | `dates`, `filters`, `stats` e `artist` sobre a amostra (`scrobbles-amostra.json`) | 30 |
| `npm run test:limite` | `scripts/teste-casos-limite.ts` | casos limite feitos à mão: datas inválidas, música a tocar, listas vazias, maiúsculas, empates, meses sem audições, faixas fora da tracklist | 26 |
| `npm run test:analise` | `scripts/teste-analise.ts` | as cinco funções da análise contra o dataset completo, com valores conferidos à mão, e casos feitos à mão | 62 |
| `npm run test:completo` | `scripts/teste-dataset-completo.mts` | integridade do dataset, totais, filtros, rankings, o percurso do artista mais ouvido, e perfis e semelhantes contra a API | 26 |

**Teste de ouro:** o `scrobblesPorHora` aplicado ao dataset completo tem de coincidir exatamente com o `/stats/listening-clock` da API. Se coincidir, `dates`, `filters` e `stats` estão certos de uma só vez.

## Estrutura

```
src/
  app/              rotas: /, /artistas/[nome] e a 404
  components/
    ui/             peças partilhadas: Bloco, estados, seletor de período, faixa de entrada, rodapé
    dashboard/      blocos do dashboard
    artista/        blocos da página do artista
    descobertas/    a análise única
  hooks/            useScrobbles, useFiltradosPor, useArtistInfo, useAlbumInfo, useScrobblesDoArtista
  lib/              funções puras: dates, filters, stats, artist, analise
  services/api.ts   pedidos à API
  store/            store Zustand com persistência
  types/            tipos da API e do domínio
scripts/            as quatro suítes de testes e o download do dataset
docs/               guias do desafio
```
