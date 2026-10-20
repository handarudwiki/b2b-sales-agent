import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="min-w-0 flex-1">
            <div className="flex h-12 items-center justify-between border-b border-border bg-white px-8">
              <p className="text-[11px] font-medium text-muted">
                Workspace <span className="mx-2 text-slate-300">/</span>{" "}
                <span className="text-foreground">Overview</span>
              </p>
              <div className="flex items-center gap-5 text-[11px] text-muted">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Semua sistem normal
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted">
                  ◌
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-300 text-[10px] font-semibold text-white">
                  AF
                </span>
              </div>
            </div>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
