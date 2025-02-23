import { FaGithub, FaEnvelope, FaDice, FaLinkedin } from 'react-icons/fa';
import { SiBluesky } from 'react-icons/si';
import Link from 'next/link';
import pkg from '../../package.json';
import ShinyText from './bits/ShinyText';

export default function Footer() {

  const versionText = `v${pkg.version}`;

  return (
    <footer className="bg-primary-bg text-muted-text py-6 text-center">
      <div className="flex justify-center items-center space-x-6 mb-4">
        <Link
          href="https://github.com/zenatron"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          className="text-muted-text hover:text-accent transition-colors text-2xl"
        >
          <FaGithub />
        </Link>
        <Link
          href="mailto:phil@underscore.games"
          aria-label="Email"
          className="text-muted-text hover:text-accent transition-colors text-2xl"
        >
          <FaEnvelope />
        </Link>
        <Link
          href="https://bsky.app/profile/zenatron.bsky.social"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Bluesky"
          className="text-muted-text hover:text-accent transition-colors text-2xl"
        >
          <SiBluesky />
        </Link>
        <Link
          href="https://www.linkedin.com/in/philipvishnevsky/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-accent transition-colors text-2xl"
        >
          <FaLinkedin />
        </Link>
        <Link 
          href="https://underscore.games"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-text hover:text-accent transition-colors text-2xl"
        >
          <FaDice />
        </Link>
      </div>
      <div className="flex items-center justify-center gap-3">
        <p className="text-xs">
          © {new Date().getFullYear()} Phil Vishnevsky. All rights reserved.
        </p>
        <Link 
          href="https://github.com/zenatron/portfolio/deployments" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <ShinyText 
            text={versionText} 
            disabled={false} 
            speed={3} 
            className="tag-bubble text-xs border-gray-600 hover:border-gray-400"
          />
        </Link>
      </div>
    </footer>
  );
}