import { FaGithub, FaEnvelope } from 'react-icons/fa';
import { SiBluesky } from 'react-icons/si';

export default function Footer() {
  return (
    <footer className="bg-secondary py-6 text-center">
      <div className="flex justify-center space-x-6 mb-4">
        <a
          href="https://github.com/zenatron"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          className="text-gray-400 hover:text-white text-2xl"
        >
          <FaGithub />
        </a>
        <a
          href="mailto:philvishnevsky@gmail.com"
          aria-label="Email"
          className="text-gray-400 hover:text-white text-2xl"
        >
          <FaEnvelope />
        </a>
        <a
          href="https://bsky.app/profile/zenatron.bsky.app"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Bluesky"
          className="text-gray-400 hover:text-white text-2xl"
        >
          <SiBluesky />
        </a>
      </div>
      <p className="text-gray-500">© {new Date().getFullYear()} Philip Vishnevsky. All rights reserved.</p>
    </footer>
  );
}