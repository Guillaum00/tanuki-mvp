"use client";

import { ButtonHTMLAttributes } from "react";

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  fullWidth?: boolean;
};

export default function Btn({ variant = "primary", fullWidth, className = "", children, ...props }: BtnProps) {
  const base = "font-bold text-sm uppercase tracking-wider py-4 px-6 border-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "text-white border-transparent",
    secondary: "bg-transparent border-current",
    ghost: "bg-transparent border-transparent underline",
  };
  const style = variant === "primary" ? { backgroundColor: "var(--tanuki-red)", color: "white", borderColor: "var(--tanuki-red)" } : {};

  return (
    <button
      className={`${base} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      style={variant === "primary" ? style : {}}
      {...props}
    >
      {children}
    </button>
  );
}
