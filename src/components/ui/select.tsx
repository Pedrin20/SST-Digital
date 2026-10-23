"use client";
import { useId, type SelectHTMLAttributes } from "react";
export function Select({ label, error, id, className = "", ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string }) {
  const generated = useId(); const inputId = id ?? generated;
  return <div className="space-y-1 text-[11px]"><label htmlFor={inputId} className="block font-medium">{label}</label><select id={inputId} aria-invalid={!!error} aria-describedby={error ? `${inputId}-error` : undefined} className={`w-full rounded-lg border border-line bg-white px-3 py-2 disabled:opacity-40 ${className}`} {...props} />{error && <p id={`${inputId}-error`} className="text-critical-text">{error}</p>}</div>;
}
