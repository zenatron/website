"use client";

import Link from "next/link";
import SpotlightCard from "./SpotlightCard";
import { ReactNode } from "react";

interface GlassCardProps {
  href: string;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  external?: boolean;
  spotlightColor?: string;
}

export default function GlassCard({
  href,
  onClick,
  children,
  className = "",
  external = false,
  spotlightColor = "rgba(255, 255, 255, 0.1)",
}: GlassCardProps) {
  const linkProps = external
    ? {
        target: "_blank",
        rel: "noopener noreferrer",
      }
    : {};

  return (
    <Link href={href} {...linkProps} className="block" onClick={onClick}>
      <SpotlightCard
        className={`p-4 md:p-6 h-full bg-neutral-800/25 backdrop-blur-md border border-neutral-600/30 shadow-lg ${className}`}
        spotlightColor={spotlightColor}
      >
        <div className="group flex flex-col h-full transition-all duration-300 transform hover:-translate-y-2">
          {children}
        </div>
      </SpotlightCard>
    </Link>
  );
}
