import { CabecalhoDescobertas } from "./CabecalhoDescobertas";
import { CartaoAberturaFecho } from "./CartaoAberturaFecho";
import { CartaoArtistaDeCasa } from "./CartaoArtistaDeCasa";
import { CartaoGenero } from "./CartaoGenero";
import { CartaoMaratona } from "./CartaoMaratona";
import { CartaoValor } from "./CartaoValor";

/**
 * A parte editorial do dashboard: cinco descobertas em painéis a toda
 * a largura, lidas em sequência como uma história. Faixa com o tema
 * invertido (as mesmas duas cores, trocadas) para se distinguir da
 * grelha de cima. Sempre sobre o histórico completo, sem seletor: o
 * cabeçalho diz que é de propósito e porquê.
 */
export function Descobertas() {
  return (
    <section
      id="descobertas"
      aria-labelledby="descobertas-titulo"
      className="tema-invertido scroll-mt-4 bg-background text-foreground"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-24 px-8 py-20 sm:gap-36 sm:py-32">
        <CabecalhoDescobertas />

        <CartaoMaratona />
        <CartaoArtistaDeCasa />
        <CartaoGenero />
        <CartaoValor />
        <CartaoAberturaFecho />
      </div>
    </section>
  );
}
