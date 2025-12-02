"use client";

import { useRef } from "react";
import { LinkItem } from "@/types/types";
import VariableProximity from "../ui/VariableProximity";
import LinkCard from "../ui/LinkCard";

interface LinksClientProps {
  links: LinkItem[];
}

export default function LinksClient({ links }: LinksClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="px-4 pb-24 pt-24 sm:px-6">
      <div className="mx-auto max-w-5xl">
      {/* Header Section */}
      <header className="mb-16 space-y-6 text-center">
        <p className="text-sm font-medium tracking-[0.2em] text-accent">LINKS</p>
        <div ref={containerRef} className="relative">
          <h1 className="text-4xl tracking-tight md:text-5xl">
            <VariableProximity
              label="Phil Vishnevsky"
              className="inline-block"
              fromFontVariationSettings="'wght' 400"
              toFontVariationSettings="'wght' 600"
              containerRef={containerRef}
              radius={150}
              falloff="gaussian"
            />
          </h1>
        </div>
        <p className="mx-auto max-w-md text-secondary-text">
          Connect with me across platforms
        </p>
        <div className="flex items-center justify-center gap-2">
          <span className="tag-bubble">SWE</span>
          <span className="tag-bubble">AI/ML</span>
          <span className="tag-bubble">Games</span>
        </div>
      </header>

      {/* Links */}
      <div className="mx-auto flex max-w-md flex-col gap-3">
        {links.map((link) => (
          <LinkCard key={link.url} item={link} />
        ))}
      </div>
      </div>
    </div>
  );
}
