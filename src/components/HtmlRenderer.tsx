'use client';

import { useRef } from 'react';

interface HtmlRendererProps {
  htmlContent: string;
  title?: string;
}

export default function HtmlRenderer({ htmlContent, title }: HtmlRendererProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Prepare content with styles to fix scrolling and script to handle links
  const contentWithStyle = `
    <style>
      html, body {
        margin: 0;
        padding: 0;
        height: auto;
        overflow: visible !important;
      }
    </style>
    <script>
      // Make all links open in a new tab
      document.addEventListener('DOMContentLoaded', function() {
        const links = document.getElementsByTagName('a');
        for (let i = 0; i < links.length; i++) {
          links[i].setAttribute('target', '_blank');
          links[i].setAttribute('rel', 'noopener noreferrer');
        }
      });

      // Also intercept clicks to ensure they open in a new tab
      document.addEventListener('click', function(e) {
        const target = e.target;
        if (target.tagName === 'A' && !target.hasAttribute('target')) {
          e.preventDefault();
          window.open(target.href, '_blank', 'noopener,noreferrer');
        }
      }, true);
    </script>
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
      sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      onLoad={(e) => {
        try {
          // Simple resize on load
          const iframe = e.currentTarget;
          if (iframe.contentWindow) {
            iframe.style.height = iframe.contentWindow.document.body.scrollHeight + 'px';
          }
        } catch (error) {
          // Fallback height if we can't access the content due to cross-origin
          console.log('Could not access iframe height, using fallback');
          e.currentTarget.style.height = '1200px';
        }
      }}
    />
  );
} 