import type { Config } from "tailwindcss";

/**
 * Les valeurs sont adossées 1:1 aux design tokens du prototype (Ground Truth).
 * Voir src/presentation/design-system/tokens.css — source de vérité unique.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#002B4C",
        "bg-elevated": "rgba(192,235,255,0.08)",
        "bg-elevated-strong": "rgba(192,235,255,0.13)",
        border: "rgba(192,235,255,0.15)",
        text: "#ffffff",
        "text-secondary": "#C0EBFF",
        accent: "#F59E71",
        "on-accent": "#002B4C",
        success: "#10B981",
        error: "#EF4444",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        pill: "999px",
      },
      boxShadow: {
        card: "0 8px 32px rgba(0,0,0,0.25)",
        "accent-cta": "0 8px 24px -8px rgba(245,158,113,0.7)",
      },
      backdropBlur: {
        glass: "20px",
      },
      maxWidth: {
        content: "448px",
      },
    },
  },
  plugins: [],
};

export default config;
