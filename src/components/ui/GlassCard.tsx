"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

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
  spotlightColor: _spotlightColor,
}: GlassCardProps) {
  const linkProps = external
    ? {
        target: "_blank",
        rel: "noopener noreferrer",
      }
    : {};

  return (
    <Link
      href={href}
      {...linkProps}
      onClick={onClick}
      className="group relative block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <div
        className={cn(
          "relative h-full overflow-hidden rounded-xl border border-white/10 bg-primary-bg/40 p-5 transition-colors duration-150 hover:border-white/20",
          className
        )}
      >
        <div className="relative z-10 flex h-full flex-col gap-4">
          {children}
        </div>
      </div>
    </Link>
  );
}
