"use client";

import { FaGithub, FaEnvelope, FaLinkedin } from "react-icons/fa";
import { FaBluesky } from "react-icons/fa6";
import Link from "next/link";
import Calendar from "@/components/ui/Calendar";
import UgIcon from "@/components/icons/UgIcon";

export default function Footer() {
  return (
    <footer className="bg-primary-bg text-muted-text py-6 text-center relative z-10">
      <div className="flex justify-center items-center space-x-4 md:space-x-8 mb-4">
        <Link
          href="https://github.com/zenatron"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          className="text-muted-text hover:text-accent transition-transform duration-200 hover:scale-110 inline-block text-2xl"
          title="GitHub"
        >
          <FaGithub />
        </Link>
        <Link
          href="mailto:phil@underscore.games"
          aria-label="Email"
          className="text-muted-text hover:text-accent transition-transform duration-200 hover:scale-110 inline-block text-2xl"
          title="Email Me!"
        >
          <FaEnvelope />
        </Link>
        <Link
          href="https://bsky.app/profile/zenatron.bsky.social"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Bluesky"
          className="text-muted-text hover:text-accent transition-transform duration-200 hover:scale-110 inline-block text-2xl"
          title="Bluesky"
        >
          <FaBluesky />
        </Link>
        <Link
          href="https://www.linkedin.com/in/philipvishnevsky/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className="text-muted-text hover:text-accent transition-transform duration-200 hover:scale-110 inline-block text-2xl"
          title="LinkedIn"
        >
          <FaLinkedin />
        </Link>
        <Calendar />
        <Link
          href="https://underscore.games"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Underscore Games"
          className="text-muted-text hover:text-accent transition-transform duration-200 hover:scale-110 inline-block text-2xl"
          title="Underscore Games"
        >
          <UgIcon className="w-7 h-7" />
        </Link>
      </div>
      <div className="flex items-center justify-center gap-3 font-atkinson">
        <p className="text-xs">
          © {new Date().getFullYear()} Phil Vishnevsky. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
