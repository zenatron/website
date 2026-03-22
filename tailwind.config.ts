import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
  ],
  theme: {
    extend: {
      colors: {
        "primary-bg": "var(--primary-bg)",
        "secondary-bg": "var(--secondary-bg)",
        "primary-text": "var(--primary-text)",
        "secondary-text": "var(--secondary-text)",
        accent: "var(--accent)",
        "btn-primary": "var(--btn-primary)",
        "btn-primary-hover": "var(--btn-primary-hover)",
        "code-bg": "var(--code-bg)",
        "code-text": "var(--code-text)",
        "muted-text": "var(--secondary-text)",
        btnPrimary: "var(--btn-primary)",
        btnPrimaryHover: "var(--btn-primary-hover)",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        hard: "var(--shadow-hard)",
      },
      borderColor: {
        light: "var(--border-light)",
        dark: "var(--border-dark)",
      },
      keyframes: {
        shine: {
          "0%": { "background-position": "100%" },
          "100%": { "background-position": "-100%" },
        },
        gradient: {
          "0%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
          "100%": { "background-position": "0% 50%" },
        },
        starMovementTop: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(500%)" },
        },
        starMovementBottom: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-500%)" },
        },
      },
      animation: {
        shine: "shine 5s linear infinite",
        gradient: "gradient 8s linear infinite",
        "star-movement-top": "starMovementTop var(--speed, 6s) linear infinite",
        "star-movement-bottom":
          "starMovementBottom var(--speed, 6s) linear infinite",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
