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
  title: "Phil Vishnevsky",
  description: "SWE + AI + Game Dev Portfolio",
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
        <EasterEggs />
        {children}
      </body>
    </html>
  );
}
