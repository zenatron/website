"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import Squares from "@/components/ui/Squares";
import GradientText from "@/components/ui/GradientText";
import VariableProximity from "@/components/ui/VariableProximity";
import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { LuConstruction } from "react-icons/lu";
// Dynamically import InfiniteSphere with SSR disabled
const InfiniteSphere = dynamic(() => import("@/components/ui/InfiniteSphere"), {
  ssr: false,
  // Optional: Add a loading skeleton or placeholder if needed
  // loading: () => <div className="h-[500px] w-full flex items-center justify-center"><p>Loading Sphere...</p></div>
});

const MOBILE_RADIUS = 120;
const DESKTOP_RADIUS = 200;

export default function AboutPage() {
  const containerRef = useRef(null);
  const [sphereRadius, setSphereRadius] = useState(DESKTOP_RADIUS);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");

    const handleResize = (event: MediaQueryListEvent | MediaQueryList) => {
      setSphereRadius(event.matches ? MOBILE_RADIUS : DESKTOP_RADIUS);
    };

    // Initial check
    handleResize(mediaQuery);

    // Listener for changes
    // Use the recommended addEventListener/removeEventListener
    mediaQuery.addEventListener("change", handleResize);

    // Cleanup listener on component unmount
    return () => {
      mediaQuery.removeEventListener("change", handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-10 relative overflow-hidden">
        <section className="flex flex-col items-center justify-center text-center animate-fade-in mb-10 z-10">
          <div
            ref={containerRef}
            style={{
              position: "relative",
              minHeight: "100px",
              width: "100%",
              padding: "10px",
            }}
          >
            <GradientText animationSpeed={24} transparent={true}>
              <VariableProximity
                label="About"
                className="text-6xl md:text-6xl font-bold"
                fromFontVariationSettings="'wght' 100, 'opsz' 8"
                toFontVariationSettings="'wght' 900, 'opsz' 48"
                containerRef={
                  containerRef as unknown as React.RefObject<HTMLElement>
                }
                radius={100}
                falloff="linear"
              />
            </GradientText>
          </div>
          <p className="text-lg md:text-xl text-muted-text leading-relaxed">
            {"Learn more about me and my work."}
          </p>
        </section>
        {/* This page is still under construction! */}
        <div className="text-lg md:text-3xl text-muted-text mt-4 text-center flex items-center justify-center gap-2">
          <LuConstruction />
          {"This page is still under construction!"}
          <LuConstruction />
        </div>
        <div className="absolute inset-0 z--10">
          <Squares direction="diagonal" speed={0.2} squareSize={96} />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10 space-y-8 mt-8 rounded-lg border border-muted p-4 md:p-8 flex justify-center items-center"
        >
          <InfiniteSphere radius={sphereRadius} />
        </motion.div>
        <p className="text-sm text-muted-text mt-4">
          {"Click on each icon to learn more!"}
        </p>
      </main>
      <Footer />
    </div>
  );
}
