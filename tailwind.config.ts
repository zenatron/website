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
        'primary-bg': 'var(--color-bg-primary)',
        'secondary-bg': 'var(--color-bg-secondary)',
        'accent-bg': 'var(--color-accent)',
        'primary-text': 'var(--color-text-primary)',
        'muted-text': 'var(--color-text-muted)',
        btnPrimary: 'var(--color-btn-primary)',
        btnPrimaryHover: 'var(--color-btn-primary-hover)',
        btnSecondary: 'var(--color-btn-secondary)',
        btnSecondaryHover: 'var(--color-btn-secondary-hover)',
        btnText: 'var(--color-btn-text)',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        hard: 'var(--shadow-hard)',
      },
      borderColor: {
        light: 'var(--border-light)',
        dark: 'var(--border-dark)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
} satisfies Config;