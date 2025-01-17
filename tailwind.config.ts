import type { Config } from "tailwindcss";

export default {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        accent: 'var(--bg-accent)',
        secondary: 'var(--bg-secondary)',
        primary: 'var(--bg-primary)',
        textLight: 'var(--color-text-light)',
        textMuted: 'var(--color-text-muted)',
        applegreen: '#8DB600',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} satisfies Config;
