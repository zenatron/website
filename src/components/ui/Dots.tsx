"use client";
import React, { useRef, useEffect, useCallback, useMemo } from "react";
import { gsap } from "gsap";
import { InertiaPlugin } from "gsap/InertiaPlugin";

gsap.registerPlugin(InertiaPlugin);

const throttle = (func: (...args: any[]) => void, limit: number) => {
  let lastCall = 0;
  return function (this: any, ...args: any[]) {
    const now = performance.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      func.apply(this, args);
    }
  };
};

interface Dot {
  cx: number;
  cy: number;
  xOffset: number;
  yOffset: number;
  _inertiaApplied: boolean;
  gridX: number; // Grid cell coordinates for spatial partitioning
  gridY: number;
}

// Spatial grid for efficient dot lookup
class SpatialGrid {
  private cellSize: number;
  private grid: Map<string, Dot[]>;

  constructor(cellSize: number) {
    this.cellSize = cellSize;
    this.grid = new Map();
  }

  private getCellKey(x: number, y: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX},${cellY}`;
  }

  add(dot: Dot) {
    const key = this.getCellKey(dot.cx, dot.cy);
    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }
    this.grid.get(key)!.push(dot);
    dot.gridX = Math.floor(dot.cx / this.cellSize);
    dot.gridY = Math.floor(dot.cy / this.cellSize);
  }

  getNearby(x: number, y: number, radius: number): Dot[] {
    const nearby: Dot[] = [];
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    const cellRadius = Math.ceil(radius / this.cellSize);

    // Check neighboring cells
    for (let dy = -cellRadius; dy <= cellRadius; dy++) {
      for (let dx = -cellRadius; dx <= cellRadius; dx++) {
        const key = `${cellX + dx},${cellY + dy}`;
        const dots = this.grid.get(key);
        if (dots) {
          nearby.push(...dots);
        }
      }
    }
    return nearby;
  }

  clear() {
    this.grid.clear();
  }
}

export interface DotGridProps {
  dotSize?: number;
  gap?: number;
  baseColor?: string;
  activeColor?: string;
  proximity?: number;
  speedTrigger?: number;
  shockRadius?: number;
  shockStrength?: number;
  maxSpeed?: number;
  resistance?: number;
  returnDuration?: number;
  className?: string;
  style?: React.CSSProperties;
  useFixedDimensions?: boolean;
}

function hexToRgb(hex: string) {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(m[1], 16),
    g: parseInt(m[2], 16),
    b: parseInt(m[3], 16),
  };
}

const DotGrid: React.FC<DotGridProps> = ({
  dotSize = 16,
  gap = 32,
  baseColor = "#111111",
  activeColor = "#111111",
  proximity = 150,
  speedTrigger = 100,
  shockRadius = 250,
  shockStrength = 5,
  maxSpeed = 5000,
  resistance = 750,
  returnDuration = 1.5,
  className = "",
  style,
  useFixedDimensions = false,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const spatialGridRef = useRef<SpatialGrid | null>(null);
  const fixedDimensionsRef = useRef<{ width: number; height: number } | null>(
    null
  );
  const pointerRef = useRef({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    speed: 0,
    lastTime: 0,
    lastX: 0,
    lastY: 0,
  });
  const lastMouseMove = useRef(Date.now());
  const rafIdRef = useRef<number | null>(null);
  let isDirty = false;
  const IDLE_TIMEOUT = 100; // Stop rendering after 100ms of no activity

  const baseRgb = useMemo(() => hexToRgb(baseColor), [baseColor]);
  const activeRgb = useMemo(() => hexToRgb(activeColor), [activeColor]);

  const circlePath = useMemo(() => {
    if (typeof window === "undefined" || !window.Path2D) return null;

    const p = new Path2D();
    p.arc(0, 0, dotSize / 2, 0, Math.PI * 2);
    return p;
  }, [dotSize]);

  const buildGrid = useCallback(() => {
    const wrap = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    let width: number, height: number;

    if (useFixedDimensions) {
      // Use fixed dimensions based on initial viewport with buffer zones
      if (!fixedDimensionsRef.current) {
        // Store initial dimensions with 50% buffer on all sides
        const bufferMultiplier = 1.5;
        fixedDimensionsRef.current = {
          width: window.innerWidth * bufferMultiplier,
          height: window.innerHeight * bufferMultiplier,
        };
      }
      width = fixedDimensionsRef.current.width;
      height = fixedDimensionsRef.current.height;
    } else {
      // Use dynamic dimensions based on wrapper with buffer
      const rect = wrap.getBoundingClientRect();
      const bufferMultiplier = 1.3;
      width = rect.width * bufferMultiplier;
      height = rect.height * bufferMultiplier;
    }

    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Center the canvas when using buffer zones
    if (useFixedDimensions) {
      const offsetX = -(width - window.innerWidth) / 2;
      const offsetY = -(height - window.innerHeight) / 2;
      canvas.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    }
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);

    const cols = Math.floor((width + gap) / (dotSize + gap));
    const rows = Math.floor((height + gap) / (dotSize + gap));
    const cell = dotSize + gap;

    const gridW = cell * cols - gap;
    const gridH = cell * rows - gap;

    const extraX = width - gridW;
    const extraY = height - gridH;

    const startX = extraX / 2 + dotSize / 2;
    const startY = extraY / 2 + dotSize / 2;

    const dots: Dot[] = [];
    // Create spatial grid with cell size = proximity * 2 for efficient queries
    const spatialGrid = new SpatialGrid(Math.max(proximity, shockRadius) * 2);
    
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cx = startX + x * cell;
        const cy = startY + y * cell;
        const dot: Dot = { cx, cy, xOffset: 0, yOffset: 0, _inertiaApplied: false, gridX: 0, gridY: 0 };
        dots.push(dot);
        spatialGrid.add(dot);
      }
    }
    dotsRef.current = dots;
    spatialGridRef.current = spatialGrid;
  }, [dotSize, gap, useFixedDimensions, proximity, shockRadius]);

  useEffect(() => {
    if (!circlePath) return;

    let rafId: number;
    let isDirty = false;
    let lastMouseMove = 0;
    const IDLE_TIMEOUT = 200; // Increase idle timeout slightly
    const proxSq = proximity * proximity;
    
    // Track which dots are actively animating or need color updates
    const activeDots = new Set<Dot>();

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Only clear and redraw if something changed
      if (isDirty) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const { x: px, y: py, speed } = pointerRef.current;
        const spatialGrid = spatialGridRef.current;
        
        // Get only nearby dots for color calculations if mouse is moving
        let dotsToCheck = dotsRef.current;
        if (speed > 0 && spatialGrid) {
          // Only check dots within proximity radius
          dotsToCheck = spatialGrid.getNearby(px, py, proximity);
        }

        // First pass: render all dots and calculate colors only for nearby ones
        for (const dot of dotsRef.current) {
          const ox = dot.cx + dot.xOffset;
          const oy = dot.cy + dot.yOffset;
          
          let style = baseColor;
          
          // Only calculate color for nearby dots
          if (speed > 0 && dotsToCheck.includes(dot)) {
            const dx = dot.cx - px;
            const dy = dot.cy - py;
            const dsq = dx * dx + dy * dy;

            if (dsq <= proxSq) {
              const dist = Math.sqrt(dsq);
              const t = 1 - dist / proximity;
              const r = Math.round(baseRgb.r + (activeRgb.r - baseRgb.r) * t);
              const g = Math.round(baseRgb.g + (activeRgb.g - baseRgb.g) * t);
              const b = Math.round(baseRgb.b + (activeRgb.b - baseRgb.b) * t);
              style = `rgb(${r},${g},${b})`;
            }
          }

          ctx.save();
          ctx.translate(ox, oy);
          ctx.fillStyle = style;
          ctx.fill(circlePath);
          ctx.restore();
        }
        
        isDirty = false;
      }

      // Check if we should keep animating
      const now = performance.now();
      const hasActiveAnimations = dotsRef.current.some(
        (dot) => Math.abs(dot.xOffset) > 0.01 || Math.abs(dot.yOffset) > 0.01
      );
      const hasRecentMouseActivity = now - lastMouseMove < IDLE_TIMEOUT;

      if (hasActiveAnimations || hasRecentMouseActivity) {
        isDirty = true;
        rafId = requestAnimationFrame(draw);
      } else {
        isDirty = false;
        // Stop the animation loop
      }
    };

    // Function to mark as dirty and restart animation if needed
    const markDirtyAndAnimate = () => {
      lastMouseMove = performance.now();
      if (!isDirty) {
        isDirty = true;
        rafId = requestAnimationFrame(draw);
      }
    };

    // Store the function so mousemove can trigger redraws
    (window as any).__dotGridMarkDirty = markDirtyAndAnimate;

    draw();
    return () => {
      cancelAnimationFrame(rafId);
      delete (window as any).__dotGridMarkDirty;
    };
  }, [proximity, baseColor, activeRgb, baseRgb, circlePath]);

  useEffect(() => {
    buildGrid();

    // Skip resize observers when using fixed dimensions
    if (useFixedDimensions) return;

    let ro: ResizeObserver | null = null;
    if ("ResizeObserver" in window) {
      ro = new ResizeObserver(buildGrid);
      wrapperRef.current && ro.observe(wrapperRef.current);
    } else {
      (window as Window).addEventListener("resize", buildGrid);
    }
    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", buildGrid);
    };
  }, [buildGrid, useFixedDimensions]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      // Trigger redraw
      if ((window as any).__dotGridMarkDirty) {
        (window as any).__dotGridMarkDirty();
      }

      const now = performance.now();
      const pr = pointerRef.current;
      const dt = pr.lastTime ? now - pr.lastTime : 16;
      const dx = e.clientX - pr.lastX;
      const dy = e.clientY - pr.lastY;
      let vx = (dx / dt) * 1000;
      let vy = (dy / dt) * 1000;
      let speed = Math.hypot(vx, vy);
      if (speed > maxSpeed) {
        const scale = maxSpeed / speed;
        vx *= scale;
        vy *= scale;
        speed = maxSpeed;
      }
      pr.lastTime = now;
      pr.lastX = e.clientX;
      pr.lastY = e.clientY;
      pr.vx = vx;
      pr.vy = vy;
      pr.speed = speed;

      const rect = canvasRef.current!.getBoundingClientRect();
      pr.x = e.clientX - rect.left;
      pr.y = e.clientY - rect.top;

      // Only check dots if speed threshold is met - use spatial grid for efficiency
      if (speed > speedTrigger && spatialGridRef.current) {
        const nearbyDots = spatialGridRef.current.getNearby(pr.x, pr.y, proximity);
        
        for (const dot of nearbyDots) {
          const dist = Math.hypot(dot.cx - pr.x, dot.cy - pr.y);
          if (dist < proximity && !dot._inertiaApplied) {
            dot._inertiaApplied = true;
            gsap.killTweensOf(dot);
            const pushX = dot.cx - pr.x + vx * 0.005;
            const pushY = dot.cy - pr.y + vy * 0.005;
            gsap.to(dot, {
              inertia: { xOffset: pushX, yOffset: pushY, resistance },
              onComplete: () => {
                gsap.to(dot, {
                  xOffset: 0,
                  yOffset: 0,
                  duration: returnDuration,
                  ease: "elastic.out(1,0.75)",
                });
                dot._inertiaApplied = false;
              },
            });
          }
        }
      }
    };

    const onClick = (e: MouseEvent) => {
      // Trigger redraw
      if ((window as any).__dotGridMarkDirty) {
        (window as any).__dotGridMarkDirty();
      }

      const rect = canvasRef.current!.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      
      // Use spatial grid to only check nearby dots
      if (spatialGridRef.current) {
        const nearbyDots = spatialGridRef.current.getNearby(cx, cy, shockRadius);
        
        for (const dot of nearbyDots) {
          const dist = Math.hypot(dot.cx - cx, dot.cy - cy);
          if (dist < shockRadius && !dot._inertiaApplied) {
            dot._inertiaApplied = true;
            gsap.killTweensOf(dot);
            const falloff = Math.max(0, 1 - dist / shockRadius);
            const pushX = (dot.cx - cx) * shockStrength * falloff;
            const pushY = (dot.cy - cy) * shockStrength * falloff;
            gsap.to(dot, {
              inertia: { xOffset: pushX, yOffset: pushY, resistance },
              onComplete: () => {
                gsap.to(dot, {
                  xOffset: 0,
                  yOffset: 0,
                  duration: returnDuration,
                  ease: "elastic.out(1,0.75)",
                });
                dot._inertiaApplied = false;
              },
            });
          }
        }
      }
    };

    const throttledMove = throttle(onMove, 16); // ~60fps max, reduced from 50ms
    window.addEventListener("mousemove", throttledMove, { passive: true });
    window.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("mousemove", throttledMove);
      window.removeEventListener("click", onClick);
    };
  }, [
    maxSpeed,
    speedTrigger,
    proximity,
    resistance,
    returnDuration,
    shockRadius,
    shockStrength,
  ]);

  return (
    <section
      className={`p-4 flex items-center justify-center h-full w-full relative ${className}`}
      style={style}
    >
      <div ref={wrapperRef} className="w-full h-full relative">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
      </div>
    </section>
  );
};

export default DotGrid;
