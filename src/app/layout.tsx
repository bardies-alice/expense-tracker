import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans } from "next/font/google";
import { NavBar } from "@/components/ui/NavBar";
import { runDueRecurringRules } from "@/lib/core/recurringService";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-fraunces",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex",
});

export const metadata: Metadata = {
  title: "Mis Gastos",
  description: "Gestión de gastos personales",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: LayoutProps<"/">) {
  await runDueRecurringRules();

  return (
    <html lang="es" className={`${fraunces.variable} ${plexSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-surface">
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-4 pb-24 sm:px-6 sm:py-6">{children}</main>
        <NavBar />
      </body>
    </html>
  );
}
