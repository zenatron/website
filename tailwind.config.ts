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
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

export default config;