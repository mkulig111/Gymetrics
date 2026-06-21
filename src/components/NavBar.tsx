"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/train", label: "Train" },
  { href: "/history", label: "History" },
  { href: "/progress", label: "Progress" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
        <nav className="flex items-center gap-5">
          {TABS.map((tab) => {
            const active = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={
                  active
                    ? "text-2xl font-extrabold text-foreground"
                    : "text-2xl font-extrabold text-muted"
                }
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
