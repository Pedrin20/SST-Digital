import type { ComponentPropsWithRef } from "react";

export const buttonVariants = {
  primary: "bg-brand-900 text-cream hover:bg-brand-800",
  secondary: "border border-line bg-white text-brand-900 hover:border-brand-200 hover:bg-cream-50",
  ghost: "text-brand-900 hover:bg-brand-50",
};
export function Button({ variant = "primary", className = "", type = "button", ...props }: ComponentPropsWithRef<"button"> & { variant?: keyof typeof buttonVariants }) {
  return <button type={type} className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${buttonVariants[variant]} ${className}`} {...props} />;
}
