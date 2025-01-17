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
        primary: '#1f2937', // Dark gray background
        secondary: '#374151', // Lighter gray for cards
        accent: '#3b82f6', // Accent color for links/buttons
      },
    },
  },
  plugins: [],
} satisfies Config;
