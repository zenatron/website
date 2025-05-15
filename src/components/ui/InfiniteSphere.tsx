"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { techLogos as techItems } from "@/lib/techLogos";

interface TechItem {
  image: string;
  link: string;
}

interface Tag {
  x: number;
  y: number;
  z: number;
  scale: number;
  element: React.ReactNode;
}

interface InfiniteSphereProps {
  items?: TechItem[];
  radius?: number;
  maxSpeed?: number;
  initialSpeed?: number;
  itemClassName?: string;
  containerClassName?: string;
}

const computePosition = (
  idx: number,
  count: number,
  radius: number,
  angleX: number,
  angleY: number
): { x: number; y: number; z: number; scale: number } => {
  const phi = Math.acos(-1 + (2 * idx + 1) / count);
  const theta = Math.sqrt(count * Math.PI) * phi;

  // Base spherical coordinates
  const sinPhi = Math.sin(phi);
  const cosPhi = Math.cos(phi);
  const sinTheta = Math.sin(theta);
  const cosTheta = Math.cos(theta);

  const x = radius * sinPhi * cosTheta;
  const y = radius * sinPhi * sinTheta;
  const z = radius * cosPhi;

  // Apply rotation around Y axis (angleY)
  const rotatedX1 = x * Math.cos(angleY) + z * Math.sin(angleY);
  const rotatedZ1 = -x * Math.sin(angleY) + z * Math.cos(angleY);

  // Apply rotation around X axis (angleX)
  const rotatedY2 = y * Math.cos(angleX) + rotatedZ1 * Math.sin(angleX);
  const rotatedZ2 = -y * Math.sin(angleX) + rotatedZ1 * Math.cos(angleX);

  // Apply perspective projection
  const perspective = 1000; // Adjust for desired perspective effect
  const scaleFactor = perspective / (perspective + rotatedZ2);

  return {
    x: rotatedX1 * scaleFactor,
    y: rotatedY2 * scaleFactor,
    z: rotatedZ2, // Keep z for depth sorting/opacity
    scale: scaleFactor,
  };
};

const InfiniteSphere: React.FC<InfiniteSphereProps> = ({
  items = techItems,
  radius = 250, // Adjust radius as needed
  maxSpeed = 50, // Increased rotation speed factor
  initialSpeed = 20, // Slower base rotation speed factor
  itemClassName = "",
  containerClassName = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [angleX, setAngleX] = useState(0);
  const [angleY, setAngleY] = useState(0);
  const speedXRef = useRef(0);
  const speedYRef = useRef(initialSpeed / 10000); // Initialize with slow base rotation
  const isHoveringCenterRef = useRef(false);
  const lastMouseXRef = useRef<number | null>(null);
  const lastMouseYRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const tags = useMemo(() => {
    return items.map((item, i) => {
      const { x, y, z, scale } = computePosition(
        i,
        items.length,
        radius,
        angleX,
        angleY
      );
      const opacity = (z + radius) / (2 * radius); // Fade out items in the back
      const clampedOpacity = Math.max(0.2, Math.min(1, opacity)); // Ensure opacity is between 0.2 and 1
      const brightness = 1 + (z / radius) * 0.5; // Make closer items brighter
      const filter = `brightness(${Math.max(0.5, Math.min(1.5, brightness))})`;

      return {
        x,
        y,
        z,
        scale,
        element: (
          <a
            key={item.link || i}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`absolute transition-transform duration-100 ease-linear ${itemClassName}`}
            style={{
              transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`,
              opacity: clampedOpacity,
              zIndex: Math.round(scale * 100),
              filter: filter,
              willChange: "transform, opacity, filter",
            }}
          >
            <img
              src={item.image}
              alt={`Tech icon ${i + 1}`}
              className="w-12 h-12 md:w-16 md:h-16 object-contain pointer-events-none"
            />
          </a>
        ),
      };
    });
  }, [items, radius, angleX, angleY, itemClassName]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const mouseX = event.clientX;
      const mouseY = event.clientY;

      const distanceToCenter = Math.sqrt(
        (mouseX - centerX) ** 2 + (mouseY - centerY) ** 2
      );
      const hoverThreshold = rect.width * 0.2; // Pause when within 20% of the center

      isHoveringCenterRef.current = distanceToCenter < hoverThreshold;

      if (!isHoveringCenterRef.current) {
        // Normalize coordinates relative to center, ranging roughly -1 to 1
        const normX = (mouseX - centerX) / (rect.width / 2);
        const normY = (mouseY - centerY) / (rect.height / 2);

        // Apply quadratic scaling for faster rotation towards edges
        const speedFactorX = normX * Math.abs(normX);
        const speedFactorY = normY * Math.abs(normY);

        // Adjust speed based on scaled position and maxSpeed
        speedYRef.current = (speedFactorX * maxSpeed) / 10000; // Rotate around Y-axis based on horizontal mouse movement
        speedXRef.current = (speedFactorY * maxSpeed) / 10000; // Rotate around X-axis based on vertical mouse movement (removed inversion)
      } else {
        // Stop rotation gradually when hovering center
        speedXRef.current *= 0.95;
        speedYRef.current *= 0.95;
      }

      lastMouseXRef.current = mouseX;
      lastMouseYRef.current = mouseY;
    };

    const handleMouseLeave = () => {
      isHoveringCenterRef.current = false;
      speedXRef.current = 0; // Reset vertical rotation speed
      speedYRef.current = initialSpeed / 10000; // Reset horizontal rotation to initial
      lastMouseXRef.current = null;
      lastMouseYRef.current = null;
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    const animate = () => {
      if (!isHoveringCenterRef.current && lastMouseXRef.current === null) {
        // Apply slight damping if not hovering center and mouse is outside
        speedXRef.current *= 0.99;
        // Only dampen Y speed if it's not already close to initial speed
        if (Math.abs(speedYRef.current - initialSpeed / 10000) > 0.00001) {
          speedYRef.current =
            speedYRef.current * 0.99 + (initialSpeed / 10000) * 0.01; // Gradually return to base speed
        } else {
          speedYRef.current = initialSpeed / 10000; // Snap to base speed if very close
        }
      } else if (isHoveringCenterRef.current) {
        // Stronger damping when hovering center
        speedXRef.current *= 0.9;
        speedYRef.current *= 0.9;
      }

      setAngleX((prev) => prev + speedXRef.current);
      setAngleY((prev) => prev + speedYRef.current);

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [initialSpeed, maxSpeed]); // Rerun effect if speeds change

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center ${containerClassName}`}
      style={{
        minHeight: `${radius * 2.5}px`,
        width: `${radius * 2.5}px`, // Make width equal to minHeight for square shape
        perspective: "1000px",
      }}
    >
      <div
        className="relative"
        style={{ width: "100%", height: "100%", transformStyle: "preserve-3d" }}
      >
        {tags.map((tag) => tag.element)}
      </div>
    </div>
  );
};

export default InfiniteSphere;
