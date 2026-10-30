import type { Config } from "tailwindcss";
export default {
  "content": [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  "theme": {
    "extend": {
      "colors": { "accent": "var(--color-accent)", "on-action": "var(--color-on-action)", "success-text": "var(--color-success-text)", "success-bg": "var(--color-success-bg)", "success-border": "var(--color-success-border)", "medium-bg": "var(--color-medium-bg)", "medium-border": "var(--color-medium-border)",
        "sidebar": "var(--color-sidebar)",
        "background": "var(--color-background)",
        "card": "var(--color-card)",
        "action": "var(--color-action)",
        "critical": "var(--color-critical)",
        "critical-text": "var(--color-critical-text)",
        "critical-bg": "var(--color-critical-bg)",
        "critical-border": "var(--color-critical-border)",
        "high": "var(--color-high)",
        "high-text": "var(--color-high-text)",
        "high-bg": "var(--color-high-bg)",
        "high-border": "var(--color-high-border)",
        "medium": "var(--color-medium)",
        "medium-text": "var(--color-medium-text)",
        "success": "var(--color-success)",
        "brand-950": "var(--color-brand-950)",
        "brand-900": "var(--color-brand-900)",
        "brand-800": "var(--color-brand-800)",
        "brand-700": "var(--color-brand-700)",
        "brand-600": "var(--color-brand-600)",
        "brand-500": "var(--color-brand-500)",
        "brand-200": "var(--color-brand-200)",
        "brand-100": "var(--color-brand-100)",
        "brand-50": "var(--color-brand-50)",
        "cream": "var(--color-cream)",
        "cream-50": "var(--color-cream-50)",
        "cream-100": "var(--color-cream-100)",
        "cream-200": "var(--color-cream-200)",
        "cream-300": "var(--color-cream-300)",
        "ink": "var(--color-ink)",
        "muted": "var(--color-muted)",
        "line": "var(--color-line)"
      },
      "borderRadius": {
        "sm": "var(--radius-sm)",
        "md": "var(--radius-md)",
        "lg": "var(--radius-lg)",
        "xl": "var(--radius-xl)",
        "full": "var(--radius-full)"
      },
      "boxShadow": {
        "card": "var(--shadow-card)",
        "button": "var(--shadow-button)",
        "logo": "var(--shadow-logo)"
      },
      "fontSize": {
        "ui-8-5": "var(--text-ui-8-5)",
        "ui-9": "var(--text-ui-9)",
        "ui-9-5": "var(--text-ui-9-5)",
        "ui-10": "var(--text-ui-10)",
        "ui-10-5": "var(--text-ui-10-5)",
        "ui-11": "var(--text-ui-11)",
        "ui-11-5": "var(--text-ui-11-5)",
        "ui-12": "var(--text-ui-12)",
        "ui-13": "var(--text-ui-13)",
        "ui-14": "var(--text-ui-14)",
        "ui-15": "var(--text-ui-15)",
        "ui-22": "var(--text-ui-22)",
        "ui-26": "var(--text-ui-26)",
        "ui-28": "var(--text-ui-28)"
      },
      "fontFamily": {
        "sans": [
          "var(--font-geist-sans)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "\"Segoe UI\"",
          "sans-serif"
        ],
        "mono": [
          "var(--font-geist-mono)",
          "ui-monospace",
          "\"SFMono-Regular\"",
          "monospace"
        ]
      }
    }
  }
} satisfies Config;

