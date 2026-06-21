import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "Gymetrics",
  description: "Track your routines, workouts, and progress.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NavBar />
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-24 pt-4">
          {children}
        </main>
      </body>
    </html>
  );
}
