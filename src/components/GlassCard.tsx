'use client';

import Link from 'next/link';
import SpotlightCard from './bits/SpotlightCard';
import { ReactNode } from 'react';

interface CardSpotlightProps {
  href: string;
  children: ReactNode;
  className?: string;
  external?: boolean;
}

export default function CardSpotlight({ 
  href, 
  children, 
  className = "", 
  external = false 
}: CardSpotlightProps) {
  const linkProps = external ? {
    target: "_blank",
    rel: "noopener noreferrer"
  } : {};

  return (
    <Link href={href} {...linkProps} className="block">
      <SpotlightCard className={`p-4 md:p-6 h-full ${className}`}>
        <div className="group flex flex-col h-full transition-all duration-300 transform hover:-translate-y-2">
          {children}
        </div>
      </SpotlightCard>
    </Link>
  );
} 