import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";

const mulish = Mulish({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-mulish" });

export const metadata: Metadata = {
  title: "Gymetrics",
  description: "Track your routines, workouts, and progress.",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full antialiased ${mulish.variable}`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NavBar />
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-24 pt-4">
          {children}
        </main>
      </body>
    </html>
  );
}
