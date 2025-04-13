import React, { useRef, useEffect, useCallback, useMemo } from "react";

const LetterGlitch = ({
  glitchColors = ["#2b4539", "#61dca3", "#61b3dc"],
  glitchSpeed = 50,
  centerVignette = false,
  outerVignette = true,
  smooth = true,
}: {
  glitchColors?: string[];
  glitchSpeed?: number;
  centerVignette?: boolean;
  outerVignette?: boolean;
  smooth?: boolean;
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const letters = useRef<
    {
      char: string;
      color: string;
      targetColor: string;
      colorProgress: number;
    }[]
  >([]);
  const grid = useRef({ columns: 0, rows: 0 });
  const context = useRef<CanvasRenderingContext2D | null>(null);

  const fontSize = 16;
  const charWidth = 10;
  const charHeight = 20;

  const lettersAndSymbols = useMemo(() => [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "!",
    "@",
    "#",
    "$",
    "&",
    "*",
    "(",
    ")",
    "-",
    "_",
    "+",
    "=",
    "/",
    "[",
    "]",
    "{",
    "}",
    ";",
    ":",
    "<",
    ">",
    ",",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
  ], []);

  const getRandomChar = useCallback(() => {
    return lettersAndSymbols[
      Math.floor(Math.random() * lettersAndSymbols.length)
    ];
  }, [lettersAndSymbols]);

  const getRandomColor = useCallback(() => {
    return glitchColors[Math.floor(Math.random() * glitchColors.length)];
  }, [glitchColors]);

  const hexToRgb = useCallback((hex: string) => {
    // Handle rgb/rgba strings
    if (hex.startsWith("rgb")) {
      const rgbValues = hex.match(/\d+/g);
      if (rgbValues && rgbValues.length >= 3) {
        return {
          r: parseInt(rgbValues[0], 10),
          g: parseInt(rgbValues[1], 10),
          b: parseInt(rgbValues[2], 10),
        };
      }
    }

    // Handle hex strings
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => {
      return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }, []);

  const interpolateColor = useCallback(
    (
      start: { r: number; g: number; b: number },
      end: { r: number; g: number; b: number },
      factor: number
    ) => {
      const result = {
        r: Math.round(start.r + (end.r - start.r) * factor),
        g: Math.round(start.g + (end.g - start.g) * factor),
        b: Math.round(start.b + (end.b - start.b) * factor),
      };
      return `rgb(${result.r}, ${result.g}, ${result.b})`;
    },
    []
  );

  const calculateGrid = useCallback(
    (width: number, height: number) => {
      const columns = Math.ceil(width / charWidth);
      const rows = Math.ceil(height / charHeight);
      return { columns, rows };
    },
    [charWidth, charHeight]
  );

  const initializeLetters = useCallback(
    (columns: number, rows: number) => {
      grid.current = { columns, rows };
      const totalLetters = columns * rows;
      letters.current = Array.from({ length: totalLetters }, () => ({
        char: getRandomChar(),
        color: getRandomColor(),
        targetColor: getRandomColor(),
        colorProgress: 1,
      }));
    },
    [getRandomChar, getRandomColor]
  );

  const drawLetters = useCallback(() => {
    if (!context.current || letters.current.length === 0 || !canvasRef.current)
      return;
    const ctx = context.current;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    // Reset all canvas state
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = "source-over";

    // Clear with black background
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Draw letters with full opacity
    ctx.font = `${fontSize}px monospace`;
    ctx.textBaseline = "top";
    ctx.globalAlpha = 1.0;

    letters.current.forEach((letter, index) => {
      const x = (index % grid.current.columns) * charWidth;
      const y = Math.floor(index / grid.current.columns) * charHeight;
      ctx.fillStyle = letter.color;
      ctx.fillText(letter.char, x, y);
    });

    // Draw vignette effects
    if (outerVignette) {
      ctx.globalCompositeOperation = "multiply";
      const gradient = ctx.createRadialGradient(
        rect.width / 2,
        rect.height / 2,
        rect.width * 0.6,
        rect.width / 2,
        rect.height / 2,
        Math.max(rect.width, rect.height)
      );

      gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0.7)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, rect.width, rect.height);
    }

    if (centerVignette) {
      ctx.globalCompositeOperation = "multiply";
      const gradient = ctx.createRadialGradient(
        rect.width / 2,
        rect.height / 2,
        0,
        rect.width / 2,
        rect.height / 2,
        rect.width * 0.6
      );

      gradient.addColorStop(0, "rgba(0, 0, 0, 0.6)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, rect.width, rect.height);
    }
  }, [outerVignette, centerVignette, fontSize, charWidth, charHeight]);

  const updateLetters = useCallback(() => {
    if (!letters.current || letters.current.length === 0) return;

    const updateCount = Math.max(1, Math.floor(letters.current.length * 0.05));

    for (let i = 0; i < updateCount; i++) {
      const index = Math.floor(Math.random() * letters.current.length);
      if (!letters.current[index]) continue;

      letters.current[index].char = getRandomChar();
      letters.current[index].targetColor = getRandomColor();

      if (!smooth) {
        letters.current[index].color = letters.current[index].targetColor;
        letters.current[index].colorProgress = 1;
      } else {
        letters.current[index].colorProgress = 0;
      }
    }
  }, [getRandomChar, getRandomColor, smooth]);

  const handleSmoothTransitions = useCallback(() => {
    let needsRedraw = false;
    letters.current.forEach((letter) => {
      if (letter.colorProgress < 1) {
        letter.colorProgress += 0.05;
        if (letter.colorProgress > 1) letter.colorProgress = 1;

        const startRgb = hexToRgb(letter.color);
        const endRgb = hexToRgb(letter.targetColor);
        if (startRgb && endRgb) {
          letter.color = interpolateColor(
            startRgb,
            endRgb,
            letter.colorProgress
          );
          needsRedraw = true;
        } else {
          letter.color = letter.targetColor;
          letter.colorProgress = 1;
        }
      }
    });

    if (needsRedraw) {
      drawLetters();
    }
  }, [hexToRgb, interpolateColor, drawLetters]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a new canvas with alpha: false and willReadFrequently: false for better performance
    context.current = canvas.getContext("2d", {
      alpha: false,
      willReadFrequently: false,
    });

    // Initialize canvas and letters
    const initCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const vh = Math.max(
        document.documentElement.clientHeight || 0,
        window.innerHeight || 0
      );
      const vw = Math.max(
        document.documentElement.clientWidth || 0,
        window.innerWidth || 0
      );
      const dpr = window.devicePixelRatio || 1;

      canvas.width = vw * dpr;
      canvas.height = vh * dpr;
      canvas.style.width = `${vw}px`;
      canvas.style.height = `${vh}px`;

      if (context.current) {
        context.current.setTransform(dpr, 0, 0, dpr, 0, 0);
        context.current.globalAlpha = 1.0;
        context.current.globalCompositeOperation = "source-over";
        context.current.fillStyle = "#000000";
        context.current.fillRect(0, 0, canvas.width, canvas.height);
      }

      const { columns, rows } = calculateGrid(vw, vh);
      initializeLetters(columns, rows);
    };

    // Start animation loop
    const startAnimation = () => {
      initCanvas();
      let lastTime = Date.now();

      const loop = () => {
        const now = Date.now();
        if (now - lastTime >= glitchSpeed) {
          updateLetters();
          drawLetters();
          lastTime = now;
        }

        if (smooth) {
          handleSmoothTransitions();
        }

        animationRef.current = requestAnimationFrame(loop);
      };

      loop();
    };

    startAnimation();

    // Handle resize
    const handleResize = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      setTimeout(() => {
        initCanvas();
        startAnimation();
      }, 100);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("resize", handleResize);
    };
  }, [
    glitchSpeed,
    smooth,
    calculateGrid,
    initializeLetters,
    updateLetters,
    drawLetters,
    handleSmoothTransitions,
  ]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};

export default LetterGlitch;
