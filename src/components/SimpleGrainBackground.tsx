"use client";

export default function SimpleGrainBackground() {
  return (
    <>
      <div className="grain-texture" />

      <style jsx>{`
        .grain-texture {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
          opacity: 0.08;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 200px 200px;
          animation: grain-shift 8s steps(10) infinite;
        }

        @keyframes grain-shift {
          0%,
          100% {
            transform: translate(0, 0);
          }
          10% {
            transform: translate(-5%, -5%);
          }
          20% {
            transform: translate(-10%, 5%);
          }
          30% {
            transform: translate(5%, -10%);
          }
          40% {
            transform: translate(-5%, 15%);
          }
          50% {
            transform: translate(-10%, 5%);
          }
          60% {
            transform: translate(15%, 0%);
          }
          70% {
            transform: translate(0%, 10%);
          }
          80% {
            transform: translate(-15%, 0%);
          }
          90% {
            transform: translate(10%, 5%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .grain-texture {
            animation: none;
          }
        }
      `}</style>
    </>
  );
}
