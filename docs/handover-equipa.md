# 🤝 Handover para a equipa — o que falta e os cuidados a ter

> Documento de passagem de testemunho. A fundação (etapas 1–6) está construída
> e testada; as etapas 7–12 são vossa. Lê tudo antes de começar — vai poupar-vos
> horas de debugging.
>
> **Complementos indispensáveis:** `docs/guia-de-estudo.md` (explicação didática
> de toda a base, com diagramas) e o guia de etapas original (o enunciado).
> **Prazo: 17/11/2026, 09:00.**

---

## 1. Estado atual — o que já está feito e VERDE

```
tsc (TypeScript)      ✅   npm run test           → 25/25 (amostra de 100)
lint (Biome)          ✅   npm run test:limite    → 18/18 (casos limite à mão)
                           npm run test:completo  → ✅ (dataset COMPLETO, 51 522 scrobbles)
```

O que existe (não refaçam, usem):

| Camada | Onde | O que vos dá |
|---|---|---|
| Tipos | `src/types/index.ts` | `Scrobble`, `ArtistInfo`, `AlbumInfo`, `Entry<T>`, `ItemRanking`, `PontoMensal`, `ArtistaSemelhante`, `Periodo`, `Status` |
| Funções puras | `src/lib/` | `dates.ts` (datas/períodos), `filters.ts` (limpeza/filtros), `stats.ts` (totais, tops, relógio 24h, género), `artist.ts` (tudo por artista) |
| Rede | `src/services/api.ts` | 3 funções de fetch + classificação de erros (404 → `NaoEncontradoError`) |
| Estado | `src/store/useStore.ts` | Zustand v5: cache por chave, persist (com `skipHydration`), dedup de pedidos |
| Hooks | `src/hooks/` | 7 hooks prontos — **são a vossa única porta para os dados** |
| Página de verificação | `src/app/page.tsx` | demonstra o ciclo período → filtros → contagem (substituir pelo dashboard) |

**A receita de cada bloco da UI já está definida e testada:** hook → função pura
em `useMemo` → 4 estados (loading / erro / vazio / sucesso). Os vossos
componentes só consomem isto — **não escrevem lógica nova**.

---

## 2. O que falta (etapas 7–12) — ordem e pesos

> Regra do guia: se atrasar, corta-se primeiro o **opcional**
> (`useAlbumInfo`, extras visuais). **Nunca** se cortam os estados de erro
> nem as funções puras. Não avancem sem cumprir o "pronto quando" de cada etapa.

### 🔵 Etapa 7 — Dashboard `/` (30% da nota) · ~meio dia
**Skills a usar, nesta ordem:** `nextjs-app-router-patterns` → `recharts` →
`design-system` + `impeccable` → `solar-icons`

Blocos, um de cada vez, do simples ao complexo:
1. Seletor de período (Tudo/30d/14d/7d/24h) — `usePeriodo`
2. Totais (audições + artistas distintos) — `totalScrobbles`, `totalArtistasDistintos`
3. Top 20 artistas com link para `/artistas/[nome]` — `topArtistas`
4. Top 10 músicas — `topMusicas`
5. Top 8 álbuns em grelha — `topAlbuns`
6. Gráfico 24h (barras Recharts, hora de pico destacada) — `scrobblesPorHora` + `horaDePico`
7. Género mais ouvido — `generoMaisOuvido`

Componentes em `components/dashboard/`; loading/erro/vazio reutilizáveis em
`components/ui/` (não repitam markup de estados em cada bloco).

**✓ Pronto quando:** mudar o período atualiza TODOS os blocos em simultâneo e
nenhum rebenta com o período vazio.

### 🔵 Etapa 8 — Página do artista `/artistas/[nome]` (30%) · ~meio dia
**Skills:** `nextjs-app-router-patterns` → `design-system` + `impeccable` →
`solar-icons` → `recharts`

**Resolvam PRIMEIRO os dois problemas que a página pode ter:**
1. `useParams` devolve o nome **codificado** → `decodeURIComponent` à entrada;
   `encodeURIComponent` em todos os links que apontam para lá.
2. Os 4 estados: loading / `not-found` (página calma com link para o dashboard) /
   `error` ("tentar de novo") / success.

Depois os blocos, todos **all-time** (usam `useScrobblesDoArtista`, ignoram o
período): cabeçalho (foto, tags, bio, links externos — podem ser `null`),
estatísticas, top 10 músicas, álbuns, scrobbles por mês, relógio 24h, últimas
audições, artistas semelhantes (só clicáveis os já ouvidos).

**✓ Pronto quando:** artista existente, artista inexistente (URL à mão) e
artista com acentos/espaços no URL se comportam bem os três.

### 🔵 Etapa 9 — Análise única · ~1/2 dia
**Skill:** `recharts` (se tiver gráfico)

Escolham UMA pergunta que passe nos 5 testes do guia: frase clara · não
replicável só com o filtro de período · não é um "top" · possível com os campos
da API · diz algo que o utilizador não sabia. A função vai para
`lib/analise.ts` (pura, testada) e o bloco para o dashboard com a pergunta
como título.

### 🟡 Etapa 10 — Acabamento · ~meio dia
**Skills:** `nextjs-zustand`, `design-system`, `impeccable`, `solar-icons`

Provocar os 4 estados à força em cada página (limitar rede, período "24h" com
dados antigos, URL de artista inexistente), verificar cache no separador
Network (navegação ida-e-volta sem repetir `/scrobbles`), responsividade
(375 px / tablet / desktop), `alt` nas imagens, foco visível, **zero avisos na
consola** (hidratação, chaves de listas).

### 🟡 Etapa 11 — Revisão final · ~1–2 h · **Skill:** `ponytail`
Percorrer: `lib/` sem `fetch` → duplicação → sem `any` → hooks com uma
responsabilidade → todos os erros tratados → as 12 armadilhas do §4 abaixo
confirmadas uma a uma.

### 🟡 Etapa 12 — Slide + demo · ~meio dia · **Skill:** `design-system`
Slide: problema → solução → **pelo menos 3 decisões vossas com o porquê**.
Demo ensaiada 3–5 min: dashboard → mudança de período → página de artista →
análise única → um estado de erro bem tratado. Preparar respostas a:
"porquê separar `lib/`?", "como evitam pedidos repetidos?", "e se a API falhar?"

---

## 3. Antes de começar: setup

```bash
npm install            # instala tudo
npm install recharts   # ⚠️ ainda NÃO está instalado — precisam dele na etapa 7
npm run dev            # abrir http://localhost:3000 (página de verificação)
npm run test           # confirmar que a base está verde antes de tocar
```

Comandos úteis durante o trabalho:

| Comando | O que faz |
|---|---|
| `npm run test` / `test:limite` / `test:completo` | as 3 suítes de testes da base |
| `npm run dataset` | descarrega o dataset completo (26 MB) para `scrobbles-completo.json` |
| `npm run lint` / `npm run format` | verificar / corrigir estilo |

⚠️ **Não commitam `scrobbles-completo.json`** — está no `.gitignore` de
propósito (26 MB). Quem precisar dele corre `npm run dataset`.

---

## 4. As 12 armadilhas (cada uma já custou tempo a alguém — não repitam)

1. **Nomes codificados** — o parâmetro da rota chega *encoded*; `decodeURIComponent` à entrada, `encodeURIComponent` em todos os links. Artista "AC/DC" ou "Sigur Rós" rebenta se esquecerem.
2. **Datas `null`** — `nowplaying` e alguns registos não têm data; `parseDataScrobble` devolve `null` e os filtros descartam. Nunca confiem que a data existe.
3. **"24h" conta desde a ÚLTIMA AUDIÇÃO** (`dataDeReferencia`), não desde agora — é por isso que o período "24h" não fica vazio. Não "corrijam" isto por engano.
4. **`skipHydration: true`** — a reidratação do persist é manual no `useHydrated`. Se hidratarem no primeiro render, erro de hidratação na consola.
5. **Não persistir `loading`** — se a página fechar a meio, o localStorage gravaria "a carregar" e a página ficava presa para sempre. A store já serializa `loading` → `idle`; não mexam no `partialize` sem perceber.
6. **`tags` é TEXTO** ("rock, soul"), não array — usem `separarLista`. O mesmo para `similar_artists` (vírgula) e `tracklist_names` (**ponto e vírgula**).
7. **Chave composta artista+faixa / artista+álbum** nos tops — "Hello" da Adele ≠ "Hello" de outro artista. As funções já fazem isto; não simplifiquem.
8. **UTC em todo o lado** (`getUTCHours`) — o gráfico 24h e a API são UTC; hora local desalinhava (o teste de ouro vs. `/stats/listening-clock` confirma hora a hora).
9. **Meses vazios preenchidos a 0** (`scrobblesPorMes`) — vale ≠ buraco no gráfico; não filtrem meses ausentes.
10. **Deduplicação de pedidos** — o Map de promessas fora da store impede dois componentes de pedirem o mesmo artista em simultâneo. Não chamem `api.ts` diretamente nos componentes.
11. **`useMemo` nos cálculos pesados** — o dataset real tem 51 522 scrobbles; refiltar a cada render congela a página. Os hooks já memoizam; novos cálculos no componente também precisam.
12. **Scrobbles sem álbum existem** (5 no dataset real) — `album_name: ""`; `topAlbuns` e `albunsDoArtista` já os ignoram (houve um bug real aqui, corrigido e testado).

## 5. Cuidados com o projeto em si

- **`lib/` nunca faz `fetch` nem usa React** — é o critério de avaliação das funções puras (15%). Lógica nova de cálculo vai sempre para `lib/` como função pura + teste.
- **Corram `npm run test` (+ `:limite`) depois de qualquer alteração a `lib/`, `services/` ou `store/`** — se partiram algo, sabem em segundos, não na demo.
- **Instalar dependências novas com atenção:** houve um caso em que o `npm install` podou um pacote que não estava no `package.json` (apanhámo-lo porque o `tsc` rebentou). Depois de instalar algo, corram `npm run lint` e `npm run test` para confirmar.
- **O `zustand` (v5) já está no `package.json`** — não instalem outra versão; o store usa padrões de v5 (currying, `useShallow`).
- **Persistência: NUNCA persistir os scrobbles** — o dataset completo tem ~25 MB e estoura a quota do localStorage (5–10 MB) em vários browsers, o que partia o app inteiro (bug apanhado em integração). O `partialize` da store só persiste `periodo` + perfis de artista/álbum; os scrobbles voltam a ser pedidos a cada sessão (a cache em memória evita repetidos durante a navegação). Há também um `armazenamentoSeguro` no store: se a escrita falhar, só sai um `console.warn` — o erro nunca se propaga para a UI. Se acrescentarem dados persistidos novos, lembrem-se disto.
- **Erro 404 é normal** (artista inexistente) e tem estado próprio (`not-found`) — não o tratem como falha de rede.
- **`useAlbumInfo` é opcional por design** — se falhar, a UI degrada com elegância; nunca deixem um álbum sem dados partir a página.
- **Imagens podem faltar** (`image_url: null`) — todas as `<img>` precisam de fallback/`alt`.
- **Finais de linha:** o Biome formata para LF; se o vosso editor gravar CRLF, corram `npm run format` antes de commitar para não poluir o diff.
- **Comunicem quem está a mexer em quê** — este repo já teve conflitos de merge (houve um `page.tsx` commitado com marcadores de conflito). `git pull` antes de começar a trabalhar.

---

## 6. Perguntas de defesa (para as terem prontas)

| Pergunta | Resposta em 15 s |
|---|---|
| "Porquê separar `lib/`?" | Funções puras sem rede nem React são previsíveis e testáveis — 3 suítes de testes correm em segundos, uma delas contra 51 522 scrobbles reais e validada contra o endpoint oficial da API. |
| "Como evitam pedidos repetidos?" | Cache por chave na store (`Entry` com `success` não volta a pedir) + Map de promessas em curso para deduplicação em tempo real + persist em localStorage. |
| "O que acontece se a API falhar?" | Erros classificados uma vez: 404 → página "não encontrado"; rede → mensagem amigável + "tentar de novo". |
| "Porquê UTC?" | O gráfico 24h e a API são em UTC; validamos hora a hora contra o `/stats/listening-clock` oficial — coincidência exata nas 24 horas. |
| "O que é o `Entry<T>`?" | O envelope padrão de qualquer dado da rede (`data`/`status`/`error`) — todos os hooks e blocos lidam com ele da mesma forma. |

**Números reais para usarem na apresentação:** 51 522 scrobbles · 2 081 artistas
distintos · Adele é o artista mais ouvido (4 345 audições, ~8,4%) · género
dominante: pop (27 954) · 5 scrobbles sem álbum · hora de pico: 16h UTC.

---

*Qualquer dúvida sobre a base construída: ver primeiro `docs/guia-de-estudo.md`
(secção correspondente) — cada decisão "porquê" está explicada lá e nos
comentários do código.*
