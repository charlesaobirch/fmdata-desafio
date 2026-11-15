import { CartaoAberturaFecho } from "./CartaoAberturaFecho";
import { CartaoArtistaDeCasa } from "./CartaoArtistaDeCasa";
import { CartaoGenero } from "./CartaoGenero";
import { CartaoMaratona } from "./CartaoMaratona";
import { CartaoValor } from "./CartaoValor";

/**
 * Secção com as cinco descobertas, pronta a pôr no dashboard.
 * Sobre o histórico completo: não depende do seletor de período.
 */
export function Descobertas() {
  return (
    <section
      aria-labelledby="descobertas-titulo"
      className="flex flex-col gap-6"
    >
      <h2
        id="descobertas-titulo"
        className="text-balance text-2xl font-semibold tracking-tight"
      >
        Descobertas — o que os teus dados sabem sobre ti
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        <CartaoMaratona />
        <CartaoArtistaDeCasa />
        <CartaoGenero />
        <CartaoValor />
        <CartaoAberturaFecho />
      </div>
    </section>
  );
}
