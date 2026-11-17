import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
      <head>
        {/* tema guardado antes da 1.ª pintura: sem flash do esquema errado
            (o BotaoTema escreve "claro"/"escuro" nesta chave) */}
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: string estática, sem input externo; tem de correr antes da 1.ª pintura
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("fmdata-tema");if(t==="claro"||t==="escuro")document.documentElement.dataset.tema=t}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
