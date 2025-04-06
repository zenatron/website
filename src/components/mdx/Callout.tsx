import React from 'react';
import { twMerge } from 'tailwind-merge';

type CalloutType = 'info' | 'warning' | 'error' | 'success' | 'note' | 'tip' | 'custom';

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  showEmoji?: boolean;
  className?: string;
  children: React.ReactNode;
}

const emojis = {
  info: '💡',
  warning: '⚠️',
  error: '❌',
  success: '✅',
  note: '📝',
  tip: '💬',
  custom: '🔍'
};

export default function Callout({ 
  type = 'info', 
  title,
  showEmoji = true,
  className,
  children 
}: CalloutProps) {
  const baseClasses = "callout";
  const calloutClasses = type === 'custom'
    ? twMerge(baseClasses, className)
    : `${baseClasses} ${type}`;

  // title and optional emoji
  if (title) {
    return (
      <div className={calloutClasses}>
        <div className="callout-title">
          {showEmoji && <span className="mr-2 text-lg">{emojis[type]}</span>}
          {title}
        </div>
        <div className="mt-2">{children}</div>
      </div>
    );
  }
  
  // no title, but we have emoji
  if (showEmoji) {
    return (
      <div className={calloutClasses}>
        <div className="flex">
          <span className="flex items-center mr-3 text-lg">{emojis[type]}</span>
          <div>{children}</div>
        </div>
      </div>
    );
  }
  
  // no title, no emoji
  return (
    <div className={calloutClasses}>
      {children}
    </div>
  );
} 