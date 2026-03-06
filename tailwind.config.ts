import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'heading': ['var(--font-neue-haas)', 'Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'body': ['var(--font-neue-haas)', 'Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'sans': ['var(--font-neue-haas)', 'Inter', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'mono': ['var(--font-jetbrains-mono)', 'monospace'],
      },
      colors: {
        // Luxury Noir Palette
        background: "#121212",           // Deep Charcoal
        surface: "#1E1E1E",              // Elevated sections/cards
        accent: "#D4AF37",               // Gold accent
        "text-high": "#F5F5F5",         // Off-white for headings
        "text-muted": "#A0A0A0",        // Subtitles/secondary text
        
        // Legacy compatibility
        foreground: "#F5F5F5",
        card: "#1E1E1E",
        "card-foreground": "#F5F5F5",
        primary: "#D4AF37",
        "primary-foreground": "#121212",
        secondary: "#2A2A2A",
        "secondary-foreground": "#F5F5F5",
        muted: "#1A1A1A",
        "muted-foreground": "#A0A0A0",
        "accent-foreground": "#121212",
        border: "#333333",
        input: "#1E1E1E",
        ring: "#D4AF37",
      },
      letterSpacing: {
        'wide-dark': '0.02em',
      },
      boxShadow: {
        'luxury': '0 4px 6px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'luxury-hover': '0 8px 25px rgba(0, 0, 0, 0.4), 0 2px 10px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 0 0 1px rgba(212, 175, 55, 0.1)',
        'luxury-glow': '0 8px 25px rgba(212, 175, 55, 0.3)',
      },
    },
  },
  plugins: [],
};
export default config;