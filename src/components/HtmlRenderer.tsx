'use client';

import { useRef } from 'react';

interface HtmlRendererProps {
  htmlContent: string;
  title?: string;
}

export default function HtmlRenderer({ htmlContent, title }: HtmlRendererProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Prepare content with styles to fix scrolling
  const contentWithStyle = `
    <style>
      html, body {
        margin: 0;
        padding: 0;
        height: auto;
        overflow: visible !important;
      }
    </style>
    ${htmlContent}
  `;

  return (
    <iframe 
      ref={iframeRef}
      title={title || 'HTML Content'}
      className="w-full border-0"
      style={{ width: '100%', border: 'none' }}
      srcDoc={contentWithStyle}
      scrolling="no"
      onLoad={(e) => {
        // Simple resize on load
        const iframe = e.currentTarget;
        if (iframe.contentWindow) {
          iframe.style.height = iframe.contentWindow.document.body.scrollHeight + 'px';
        }
      }}
    />
  );
} 