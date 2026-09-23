import type { Config } from "tailwindcss";

/**
 * Tailwind v4: the design tokens live in `app/globals.css` under `@theme`.
 * This config only declares content sources for older tooling compatibility.
 */
const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
};

export default config;
