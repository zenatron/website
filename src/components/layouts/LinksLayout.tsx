"use client";

import Squares from "@/components/ui/Squares";
import { LinkItem } from "@/types/types";
import LinksClient from "@/components/layouts/LinksClient";
import Header from "../Header";

export default function LinksLayout({ links }: { links: LinkItem[] }) {
  return (
    <main className="flex-1 relative overflow-hidden">
      <Header />
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <Squares direction="diagonal" speed={0.2} squareSize={96} />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 px-6 py-10">
        <LinksClient links={links} />
      </div>
    </main>
  );
} 