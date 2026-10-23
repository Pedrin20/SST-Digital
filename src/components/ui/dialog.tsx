"use client";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "./button";
export function Dialog({ open, onClose, title, children, sheet = false }: { open: boolean; onClose: () => void; title: string; children: ReactNode; sheet?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null); const id = useId();
  useEffect(() => { const dialog = ref.current; if (!dialog) return; if (open && !dialog.open) dialog.showModal(); else if (!open && dialog.open) dialog.close(); }, [open]);
  return <dialog ref={ref} aria-labelledby={id} onCancel={e => { e.preventDefault(); onClose(); }} onClose={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }} className={`border border-line bg-white p-0 text-ink shadow-card backdrop:bg-brand-950/40 ${sheet ? "fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-full max-w-md" : "m-auto w-[calc(100%-2rem)] max-w-lg rounded-xl"}`}><div className="p-5"><div className="mb-4 flex items-center justify-between gap-4"><h2 id={id} className="text-[15px] font-semibold">{title}</h2><Button variant="ghost" onClick={onClose} aria-label="Fechar">✕</Button></div>{children}</div></dialog>;
}
export function Sheet(props: Omit<Parameters<typeof Dialog>[0], "sheet">) { return <Dialog {...props} sheet />; }
