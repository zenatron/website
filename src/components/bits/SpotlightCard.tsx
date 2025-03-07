import React, { useRef, useState, useEffect } from "react";

interface Position {
  x: number;
  y: number;
}

interface SpotlightCardProps extends React.PropsWithChildren {
  className?: string;
  spotlightColor?: string;
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = "",
  spotlightColor,
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState<number>(0);
  const [currentSpotlightColor, setCurrentSpotlightColor] = useState<string>("rgba(255, 255, 255, 0.1)");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Effect to detect theme changes
  useEffect(() => {
    const updateColors = () => {
      if (spotlightColor) {
        setCurrentSpotlightColor(spotlightColor);
        return;
      }

      // Check if the document has a 'dark' class or data attribute
      const isDark = document.documentElement.classList.contains('dark') || 
                     document.documentElement.getAttribute('data-theme') === 'dark';
      
      setIsDarkMode(isDark);
      
      // Default to white for dark mode, dark for light mode
      if (isDark) {
        // Dark mode - use white spotlight
        setCurrentSpotlightColor("rgba(255, 255, 255, 0.1)");
      } else {
        // Light mode - use dark spotlight
        setCurrentSpotlightColor("rgba(0, 0, 0, 0.05)");
      }
    };

    updateColors();

    // Set up a MutationObserver to detect class changes on the html element
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && 
           (mutation.attributeName === 'class' || mutation.attributeName === 'data-theme')) {
          updateColors();
          break;
        }
      }
    });
    
    observer.observe(document.documentElement, { 
      attributes: true,
      attributeFilter: ['class', 'data-theme'] 
    });

    // Also listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = () => {
      // Only apply this if no explicit theme is set on the document
      if (!document.documentElement.classList.contains('dark') && 
          !document.documentElement.classList.contains('light') &&
          !document.documentElement.hasAttribute('data-theme')) {
        updateColors();
      }
    };
    
    mediaQuery.addEventListener('change', handleMediaChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleMediaChange);
    };
  }, [spotlightColor]);

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!divRef.current || isFocused) return;

    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(0.6);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    setOpacity(0.6);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-3xl transition-colors duration-300 overflow-hidden 
      ${isDarkMode 
        ? 'border border-white/10 bg-white/5 hover:bg-white/10 shadow-[inset_0_0.5px_0_0.5px_rgba(255,255,255,0.1)]' 
        : 'border border-black/10 bg-black/5 hover:bg-black/10 shadow-[0_2px_10px_rgba(0,0,0,0.05)]'
      }
      backdrop-blur-sm ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out"
        style={{
          opacity,
          background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${currentSpotlightColor}, transparent 80%)`,
        }}
      />
      {children}
    </div>
  );
};

export default SpotlightCard;