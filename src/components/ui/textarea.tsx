"use client";
import { useId, type TextareaHTMLAttributes } from "react";
export function Textarea({ label, error, id, className = "", ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string }) {
  const generated = useId(); const fieldId = id ?? generated;
  return <div className="space-y-1.5 text-sm"><label htmlFor={fieldId} className="block font-medium">{label}</label><textarea id={fieldId} rows={3} aria-invalid={!!error} aria-describedby={error ? `${fieldId}-error` : undefined} className={`w-full resize-y rounded-lg border border-line bg-white px-3 py-2 text-ink transition-colors hover:border-brand-200 focus-visible:border-brand-600 aria-invalid:border-critical disabled:cursor-not-allowed disabled:opacity-40 ${className}`} {...props} />{error && <p id={`${fieldId}-error`} className="text-critical-text">{error}</p>}</div>;
}
