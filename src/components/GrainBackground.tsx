"use client";

export default function GrainBackground() {
  return (
    <>
      <svg className="grain-svg" aria-hidden="true">
        <defs>
          <filter id="grain-noise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="1.5"
              numOctaves="4"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
      </svg>
      <div className="grain-overlay" aria-hidden="true" />

      <style jsx>{`
        .grain-svg {
          position: fixed;
          width: 0;
          height: 0;
        }

        .grain-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 50;
          opacity: 0.1;
          background: rgba(255, 255, 255, 0.08);
          filter: url(#grain-noise);
          mix-blend-mode: lighten;
        }

        @media (prefers-reduced-motion: no-preference) {
          .grain-overlay {
            animation: grain-shift 8s steps(10) infinite;
          }
        }
      `}</style>
    </>
  );
}
