import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppHeader } from "@/components/app-header";
import { TopLoaderProvider } from "@/components/top-loader";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prospera — Growth & Sales Copilot",
  description:
    "Prospera: AI-powered prospecting, WhatsApp sales assistant, dan konten marketing untuk CV Arba'in Jaya Mandiri.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${jakarta.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <TopLoaderProvider>
          <AppHeader />
          <main className="mx-auto w-full max-w-360 flex-1 px-4 pb-16 sm:px-6 lg:px-10">
            {children}
          </main>
          <footer className="mx-auto w-full max-w-360 px-4 pb-8 sm:px-6 lg:px-10">
            <div className="flex flex-col gap-2 border-t border-line pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
              <p>
                <span className="font-semibold text-ink-2">CV Arba&apos;in Jaya Mandiri</span>{" "}
                · AI membantu tim sales bekerja lebih efektif, bukan menggantikan
                konsultasi dan keputusan manusia.
              </p>
              <p className="shrink-0">Prospera · Growth &amp; Sales Copilot</p>
            </div>
          </footer>
        </TopLoaderProvider>
      </body>
    </html>
  );
}
