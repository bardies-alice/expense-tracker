import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NavBar } from "@/components/ui/NavBar";
import { runDueRecurringRules } from "@/lib/core/recurringService";
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
  title: "Mis Gastos",
  description: "Gestión de gastos personales",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: LayoutProps<"/">) {
  await runDueRecurringRules();

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#f7fafc]">
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-6 py-6 pb-28">{children}</main>
        <NavBar />
      </body>
    </html>
  );
}
