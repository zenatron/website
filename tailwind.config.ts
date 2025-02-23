import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-text': 'var(--primary-text)',
        'primary-bg': 'var(--primary-bg)',
        'accent': 'var(--accent)',
        'btnPrimary': 'var(--btn-primary)',
        'btnPrimaryHover': 'var(--btn-primary-hover)',
        'muted-text': 'var(--muted-text)',
        'code-bg': 'var(--code-bg)',
        'code-text': 'var(--code-text)',
        'secondary-bg': 'var(--secondary-bg)',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        hard: 'var(--shadow-hard)',
      },
      borderColor: {
        light: 'var(--border-light)',
        dark: 'var(--border-dark)',
      },
      keyframes: {
        shine: {
          '0%': { 'background-position': '100%' },
          '100%': { 'background-position': '-100%' },
        },
        gradient: { 
          '0%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
          '100%': { 'background-position': '0% 50%' },
        },
      },
      animation: {
        shine: 'shine 5s linear infinite',
        gradient: 'gradient 8s linear infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

export default config;