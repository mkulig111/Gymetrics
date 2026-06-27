"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/train", label: "Train" },
  { href: "/history", label: "History" },
  { href: "/progress", label: "Progress" },
  { href: "/exercises", label: "Exercises" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 bg-background px-4 pt-4">
      <nav className="mx-auto flex w-full max-w-2xl gap-1 rounded-full bg-surface p-1">
        {TABS.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex-1 rounded-full py-2.5 text-center text-sm font-bold transition-colors ${
                active ? "bg-foreground text-background" : "text-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
