import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Roboto_Flex,
  Atkinson_Hyperlegible,
} from "next/font/google";
import "./globals.css";
import "./markdown.css";

// Optimize font loading with preload and display swap
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const robotoFlex = Roboto_Flex({
  variable: "--font-roboto-flex",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} ${robotoFlex.variable} ${atkinson.variable}`}
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
        {children}
      </body>
    </html>
  );
}
