import { FaGithub, FaEnvelope, FaDice } from 'react-icons/fa';
import { SiBluesky } from 'react-icons/si';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-secondary-bg text-muted-text py-6 text-center">
      <div className="flex justify-center items-center space-x-6 mb-4">
        <a
          href="https://github.com/zenatron"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          className="text-muted-text hover:text-accent transition-colors text-2xl"
        >
          <FaGithub />
        </a>
        <a
          href="mailto:philvishnevsky@gmail.com"
          aria-label="Email"
          className="text-muted-text hover:text-accent transition-colors text-2xl"
        >
          <FaEnvelope />
        </a>
        <a
          href="https://bsky.app/profile/zenatron.bsky.social"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Bluesky"
          className="text-muted-text hover:text-accent transition-colors text-2xl"
        >
          <SiBluesky />
        </a>
        <Link 
          href="https://underscore.games"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-text hover:text-accent transition-colors text-2xl"
        >
          <FaDice />
        </Link>
      </div>
      <p className="text-sm">
        © {new Date().getFullYear()} Philip Vishnevsky. All rights reserved.
      </p>
    </footer>
  );
}