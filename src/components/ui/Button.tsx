"use client";

import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const styles: Record<Variant, string> = {
  primary: "bg-accent text-black font-bold hover:opacity-90",
  secondary: "bg-surface-2 text-foreground hover:bg-border",
  ghost: "bg-transparent text-foreground hover:bg-surface-2",
  danger: "bg-danger-bg text-danger hover:opacity-90",
};

export default function Button({
  variant = "secondary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`rounded-full px-4 py-2.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
