import { Metadata } from "next";
import LinksClient from "@/components/layouts/LinksClient";
import Header from "@/components/Header";
import { links } from "@/lib/links";
import Footer from "@/components/Footer";
import GrainBackground from "@/components/GrainBackground";

export const metadata: Metadata = {
  title: "Links",
  description: "A collection of my important links.",
};

export default function Page() {
  return (
    <main className="flex-1 relative overflow-hidden">
      <GrainBackground />
      <Header />
      {/* Content */}
      <div className="relative z-10 px-6 py-10 pt-10">
        <LinksClient links={links} />
      </div>
      <Footer />
    </main>
  );
}
