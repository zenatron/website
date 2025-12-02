import { Metadata } from "next";
import LinksClient from "@/components/layouts/LinksClient";
import Header from "@/components/Header";
import { links } from "@/lib/links";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Links",
  description: "A collection of my important links.",
};

export default function Page() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <LinksClient links={links} />
      </main>
      <Footer />
    </div>
  );
}
