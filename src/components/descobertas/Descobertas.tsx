import { CartaoAberturaFecho } from "./CartaoAberturaFecho";
import { CartaoArtistaDeCasa } from "./CartaoArtistaDeCasa";
import { CartaoGenero } from "./CartaoGenero";
import { CartaoMaratona } from "./CartaoMaratona";
import { CartaoValor } from "./CartaoValor";

/**
 * A parte editorial do dashboard: cinco descobertas em painéis a toda
 * a largura, lidas em sequência como uma história. Faixa com o tema
 * invertido (as mesmas duas cores, trocadas) para se distinguir da
 * grelha de cima. Sobre o histórico completo: não depende do seletor
 * de período.
 */
export function Descobertas() {
  return (
    <section
      aria-labelledby="descobertas-titulo"
      className="tema-invertido bg-background text-foreground"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-24 px-8 py-20 sm:gap-36 sm:py-32">
        <header className="flex flex-col gap-4">
          <h2
            id="descobertas-titulo"
            className="max-w-3xl text-balance text-3xl font-semibold tracking-tight sm:text-5xl"
          >
            Descobertas — o que os teus dados sabem sobre ti
          </h2>
          <p className="max-w-prose text-pretty text-foreground/75">
            Sobre todo o teu histórico: o período escolhido lá em cima não muda
            nada daqui para baixo.
          </p>
        </header>

        <CartaoMaratona />
        <CartaoArtistaDeCasa />
        <CartaoGenero />
        <CartaoValor />
        <CartaoAberturaFecho />
      </div>
    </section>
  );
}
