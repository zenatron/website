"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import Squares from "@/components/ui/Squares";
import GradientText from "@/components/ui/GradientText";
import VariableProximity from "@/components/ui/VariableProximity";
import { useRef } from "react";
import { LuConstruction } from "react-icons/lu";
import ShinyText from "@/components/ui/ShinyText";
export default function AboutPage() {
  const containerRef = useRef(null);

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
        <div className="absolute inset-0 z-0">
          <Squares direction="diagonal" speed={0.2} squareSize={96} />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10 w-full max-w-4xl space-y-8"
        >
          <section className="space-y-8 max-w-2xl mx-auto">
            <LuConstruction className="inline-block text-9xl text-muted-text" />
            <ShinyText
              text={
                "This page is under construction. Please check back soon!"
              }
              className="text-4xl"
            />
          </section>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
