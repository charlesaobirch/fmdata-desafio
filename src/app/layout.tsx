import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "fmdata — Dashboard Last.fm",
  description:
    "Análise do teu histórico de scrobbles do Last.fm: períodos, tops, gráfico 24h e perfis de artista.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt"
      // o script anti-flash escreve data-tema no <html> antes da 1.ª
      // pintura: o servidor não o conhece, e a divergência do atributo é
      // intencional. Só vale para este elemento — os filhos continuam
      // com os avisos de hidratação a rigor.
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* tema guardado antes da 1.ª pintura, sem flash do esquema errado
            (o BotaoTema escreve "claro"/"escuro" nesta chave). Via
            next/script: um <script> cru dentro de um componente dispara
            o aviso do React 19; beforeInteractive corre no HTML inicial,
            antes de qualquer hidratação. */}
        <Script id="tema" strategy="beforeInteractive">
          {`try{var t=localStorage.getItem("fmdata-tema");if(t==="claro"||t==="escuro")document.documentElement.dataset.tema=t}catch(e){}`}
        </Script>
        {children}
      </body>
    </html>
  );
}
