"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import VariableProximity from "@/components/ui/VariableProximity";

export default function HomeHero() {
  const headingRef = useRef<HTMLDivElement>(null);

  return (
    <div className="space-y-8">
      <div className="space-y-6" ref={headingRef}>
        <p className="text-sm font-medium tracking-[0.2em] text-accent">
          SOFTWARE ENGINEER
        </p>
        
        <h1 className="text-5xl leading-[1.1] tracking-tight md:text-6xl lg:text-7xl">
          <VariableProximity
            label="Phil Vishnevsky"
            className="inline-block"
            fromFontVariationSettings="'wght' 400"
            toFontVariationSettings="'wght' 600"
            radius={150}
            falloff="gaussian"
            containerRef={headingRef}
          />
        </h1>
        
        <p className="max-w-lg text-lg leading-relaxed text-secondary-text">
          Building things at the intersection of AI and games. 
          I like code that&apos;s easy to delete and deploys that don&apos;t wake anyone up.
        </p>
      </div>

      {/* CTA row */}
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/projects" className="btn btn-primary">
          View work
          <ArrowUpRight className="h-4 w-4" />
        </Link>
        <Link href="/about" className="btn btn-secondary">
          About me
        </Link>
        <div className="flex items-center gap-3 pl-2">
          <Link 
            href="https://github.com/zenatron" 
            target="_blank"
            className="text-muted-text transition-colors hover:text-primary-text"
            aria-label="GitHub"
          >
            <FaGithub className="h-5 w-5" />
          </Link>
          <Link 
            href="https://linkedin.com/in/philipvishnevsky" 
            target="_blank"
            className="text-muted-text transition-colors hover:text-primary-text"
            aria-label="LinkedIn"
          >
            <FaLinkedin className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
