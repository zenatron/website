"use client";

import { LinkItem } from "@/types/types";
import LinksClient from "@/components/layouts/LinksClient";
import Header from "../Header";

export default function LinksLayout({ links }: { links: LinkItem[] }) {
  return (
    <main className="flex-1 relative overflow-hidden">
      <Header />
      {/* Content */}
      <div className="relative z-10 px-6 py-10 pt-10">
        <LinksClient links={links} />
      </div>
    </main>
  );
}
