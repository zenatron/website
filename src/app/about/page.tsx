"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTopButton from "@/components/BackToTopButton";
import GitHubReadme from "@/components/ui/GitHubReadme";
import HobbiesSection from "@/components/ui/HobbiesSection";
import ResumeSection from "@/components/ui/ResumeSection";
import { ArrowUpRight, MapPin, Briefcase, Clock } from "lucide-react";
import Link from "next/link";

const QUICK_FACTS = [
  { label: "Location", value: "Charlotte, NC", icon: MapPin },
  { label: "Focus", value: "SWE · AI · Games", icon: Briefcase },
  { label: "Status", value: "Open to opportunities", icon: Clock },
];

export default function AboutPage() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section - matching home page style */}
        <section className="px-4 pb-24 pt-32 sm:px-6 md:pt-40">
          <div className="mx-auto max-w-5xl">
            <div className="space-y-8 text-center">
              <div className="space-y-6">
                <p className="text-sm font-medium tracking-[0.2em] text-accent">
                  ABOUT
                </p>
                <h1 className="text-4xl tracking-tight md:text-5xl lg:text-6xl">
                  Phil Vishnevsky
                </h1>
                <p className="mx-auto max-w-2xl text-lg leading-relaxed text-secondary-text">
                  I write code, break things, and occasionally ship something useful. 
                  CS student at UNC Charlotte. Making games and AI tools on the side.
                </p>
              </div>

              {/* Quick facts row */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                {QUICK_FACTS.map((fact, i) => (
                  <div key={fact.label} className="flex items-center gap-2 text-secondary-text">
                    <fact.icon className="h-4 w-4 text-muted-text" />
                    <span>{fact.value}</span>
                    {i < QUICK_FACTS.length - 1 && (
                      <span className="ml-4 h-1 w-1 rounded-full bg-white/20" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Content Sections */}
        <div className="mx-auto max-w-5xl px-4 space-y-32 pb-24 sm:px-6">
          
          {/* Resume Section */}
          <section id="resume" className="scroll-mt-24">
            <div className="space-y-8">
              <div className="space-y-4 text-center">
                <p className="text-sm font-medium tracking-[0.2em] text-accent">
                  EXPERIENCE
                </p>
                <h2 className="text-3xl tracking-tight md:text-4xl">
                  The story so far
                </h2>
                <p className="text-secondary-text max-w-xl mx-auto">
                  Started coding in 2020. Haven&apos;t really stopped.
                </p>
              </div>
              <ResumeSection />
            </div>
          </section>

          {/* Skills & Tech Section */}
          <section id="skills" className="scroll-mt-24">
            <div className="space-y-8">
              <div className="space-y-4 text-center">
                <p className="text-sm font-medium tracking-[0.2em] text-accent">
                  SKILLS
                </p>
                <h2 className="text-3xl tracking-tight md:text-4xl">
                  Tech & expertise
                </h2>
              </div>
              <GitHubReadme repo="zenatron/zenatron" processSections={true} />
            </div>
          </section>

          {/* Apps, Tools & Hobbies Section */}
          <section id="hobbies" className="scroll-mt-24">
            <div className="space-y-8">
              <div className="space-y-4 text-center">
                <p className="text-sm font-medium tracking-[0.2em] text-accent">
                  OFF THE CLOCK
                </p>
                <h2 className="text-3xl tracking-tight md:text-4xl">
                  Stuff I like
                </h2>
                <p className="text-secondary-text max-w-xl mx-auto">
                  Apps I use, hobbies I have, opinions I&apos;ll probably change.
                </p>
              </div>
              <HobbiesSection />
            </div>
          </section>
        </div>
      </main>

      <Footer />
      <BackToTopButton />
    </div>
  );
}
