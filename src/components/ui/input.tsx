"use client";
import { useId, type InputHTMLAttributes } from "react";
export function Input({ label, error, id, className = "", ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  const generated = useId(); const inputId = id ?? generated;
  return <div className="space-y-1.5 text-sm"><label htmlFor={inputId} className="block font-medium">{label}</label><input id={inputId} aria-invalid={!!error} aria-describedby={error ? `${inputId}-error` : undefined} className={`h-11 w-full rounded-lg border border-line bg-white px-3 py-2 text-ink transition-colors hover:border-brand-200 focus-visible:border-brand-600 aria-invalid:border-critical disabled:cursor-not-allowed disabled:opacity-40 ${className}`} {...props} />{error && <p id={`${inputId}-error`} className="text-critical-text">{error}</p>}</div>;
}

