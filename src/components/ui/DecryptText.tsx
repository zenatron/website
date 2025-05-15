"use client";

import React, { useState, useEffect, useRef } from "react";
import ShinyText from "./ShinyText";

interface DecryptTextProps {
  initialText: string;
  finalText: string;
  className?: string;
  shinySpeed?: number;
  decryptionSpeed?: number;
}

const DecryptText: React.FC<DecryptTextProps> = ({
  initialText,
  finalText,
  className = "",
  shinySpeed = 5,
  decryptionSpeed = 40,
}) => {
  const [displayText, setDisplayText] = useState(initialText);
  const [isHovering, setIsHovering] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Characters to use during the "decryption" animation
  const chars =
    "abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,./<>?";
  //const chars = "philvishnevsky";

  // Function to start the decryption animation
  const startDecryption = () => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    let iteration = 0;
    const maxIterations = 15; // Number of scrambling iterations

    // Create a new interval
    intervalRef.current = setInterval(() => {
      if (iteration >= maxIterations) {
        // Final iteration - show the actual text
        setDisplayText(finalText);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }

      // Create a partially decrypted version
      setDisplayText(
        finalText
          .split("")
          .map((targetChar, index) => {
            // For spaces, always show spaces
            if (targetChar === " ") return " ";

            // Gradually reveal more characters as iterations progress
            const progress = iteration / maxIterations;
            const shouldRevealChar =
              Math.random() < progress || index < progress * finalText.length;

            if (shouldRevealChar) {
              return targetChar;
            }

            // Random character for others
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      iteration += 1;
    }, decryptionSpeed);
  };

  // Function to start the encryption animation (back to initial text)
  const startEncryption = () => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    let iteration = 0;
    const maxIterations = 10; // Number of scrambling iterations

    // Create a new interval
    intervalRef.current = setInterval(() => {
      if (iteration >= maxIterations) {
        // Final iteration - show the initial text
        setDisplayText(initialText);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }

      // Create a partially encrypted version
      setDisplayText(
        initialText
          .split("")
          .map((targetChar, index) => {
            // For spaces, always show spaces
            if (targetChar === " ") return " ";

            // Gradually reveal more characters as iterations progress
            const progress = iteration / maxIterations;
            const shouldRevealChar =
              Math.random() < progress || index < progress * initialText.length;

            if (shouldRevealChar) {
              return targetChar;
            }

            // Random character for others
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      iteration += 1;
    }, decryptionSpeed);
  };

  // Handle mouse enter/leave
  useEffect(() => {
    if (isHovering) {
      startDecryption();
    } else if (displayText !== initialText) {
      startEncryption();
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHovering]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="cursor-pointer"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <ShinyText text={displayText} className={className} speed={shinySpeed} />
    </div>
  );
};

export default DecryptText;
