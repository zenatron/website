import { links } from "@/lib/links";
import LinksLayout from "@/components/layouts/LinksLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Links",
  description: "A collection of my important links.",
};

export default function LinksPage() {
  return <LinksLayout links={links} />;
} 