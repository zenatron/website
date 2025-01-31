/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
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
        // ... any other colors you have
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}