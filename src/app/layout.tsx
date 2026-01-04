import type { Metadata } from "next";
import {
  Plus_Jakarta_Sans,
  Space_Grotesk,
  Atkinson_Hyperlegible,
} from "next/font/google";
import "./globals.css";
import "./markdown.css";
import EasterEggs from "@/components/EasterEggs";

// Optimize font loading with preload and display swap
const bodySans = Plus_Jakarta_Sans({
  variable: "--font-body-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

const displaySans = Space_Grotesk({
  variable: "--font-display-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-atkinson",
  preload: true,
});

export const metadata: Metadata = {
  title: "Phil Vishnevsky | SWE, AI Enthusiast, and Homelabber",
  description: "I'm a software engineer crafting AI projects, tools, homelabs, and games. Explore my portfolio, technical blog posts, and latest development work.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${bodySans.variable} ${displaySans.variable} ${atkinson.variable}`}
    >
      <head>
        {/* Preconnect to font and CDN origins for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
      </head>
      <body className="antialiased bg-primary-bg text-primary-text">
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-primary-bg focus:outline-none"
        >
          Skip to main content
        </a>
        <EasterEggs />
        {children}
      </body>
    </html>
  );
}
