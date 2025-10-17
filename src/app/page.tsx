"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  FaProjectDiagram,
  FaUser,
  FaLightbulb,
  FaCode,
  FaRocket,
} from "react-icons/fa";
import { useRef } from "react";
import { motion } from "framer-motion";
import VariableProximity from "@/components/ui/VariableProximity";
import GradientText from "@/components/ui/GradientText";
import GlassCard from "@/components/ui/GlassCard";
import ShinyText from "@/components/ui/ShinyText";
import dynamic from "next/dynamic";
import GrainBackground from "@/components/GrainBackground";

// Lazy load DotGrid with no SSR for better performance
const DotGrid = dynamic(() => import("@/components/ui/Dots"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 w-screen h-screen bg-primary-bg" />
  ),
});

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen flex flex-col bg-primary-bg text-primary-text">
      <GrainBackground />
      {/* <div className="fixed inset-0 w-screen h-screen">
        <div style={{ width: "100%", height: "100vh", position: "relative" }}>
          <DotGrid
            dotSize={4}
            gap={15}
            baseColor="#161616"
            activeColor="#242424"
            proximity={120}
            shockRadius={250}
            useFixedDimensions={true}
            shockStrength={5}
            resistance={750}
            returnDuration={1.5}
          />
        </div>
      </div> */}
      {/* Scrollable content */}
      <div className="relative z-20 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-20">
          {/* Hero Section */}
          <motion.section
            className="max-w-4xl py-12"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {/* Main title with enhanced effects */}
            <div className="relative mb-8">
              <div
                ref={containerRef}
                style={{
                  position: "relative",
                  minHeight: "120px",
                  width: "100%",
                  padding: "20px",
                }}
              >
                <GradientText
                  className="mb-6"
                  animationSpeed={24}
                  transparent={true}
                  colors={["#00d4ff", "#0099ff", "#0047ff", "#00d4ff"]}
                >
                  <div className="flex flex-col items-center gap-2">
                    <VariableProximity
                      label="Hey,"
                      className="text-6xl md:text-8xl font-bold tracking-tight"
                      fromFontVariationSettings="'wght' 100, 'opsz' 8"
                      toFontVariationSettings="'wght' 900, 'opsz' 48"
                      containerRef={
                        containerRef as unknown as React.RefObject<HTMLElement>
                      }
                      radius={120}
                      falloff="gaussian"
                    />
                    <VariableProximity
                      label="I'm Phil!"
                      className="text-6xl md:text-8xl font-bold tracking-tight"
                      fromFontVariationSettings="'wght' 100, 'opsz' 8"
                      toFontVariationSettings="'wght' 900, 'opsz' 48"
                      containerRef={
                        containerRef as unknown as React.RefObject<HTMLElement>
                      }
                      radius={120}
                      falloff="gaussian"
                    />
                  </div>
                </GradientText>
              </div>

              {/* Floating accent elements */}
              <motion.div
                className="absolute -top-4 -right-4 text-accent/20"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <FaCode size={24} />
              </motion.div>

              <motion.div
                className="absolute -bottom-4 -left-4 text-accent/20"
                animate={{
                  rotate: [360, 0],
                  scale: [1, 1.3, 1],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <FaRocket size={20} />
              </motion.div>
            </div>

            {/* Enhanced subtitle */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.25 }}
            >
              <ShinyText
                text={"Let's build something amazing together."}
                disabled={false}
                speed={3}
                className="tag-bubble text-sm md:text-xl border-gray-600 hover:border-gray-400 transition-all duration-300 hover:scale-105"
              />

              <motion.p
                className="text-secondary-text text-sm md:text-base max-w-2xl mx-auto leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25, duration: 0.25 }}
              >
                {"SWE • AI/ML • Games"}
              </motion.p>
            </motion.div>
          </motion.section>

          {/* Enhanced Navigation Cards */}
          <motion.section
            className="mt-4 grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3 mx-auto max-w-3xl w-full px-4 py-4"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {[
              {
                href: "/projects",
                icon: FaProjectDiagram,
                title: "Projects",
                description: "Explore my latest work",
                spotlightColor: "rgba(59, 130, 246, 0.15)",
              },
              {
                href: "/blog",
                icon: FaLightbulb,
                title: "Blog",
                description: "Thoughts and insights",
                spotlightColor: "rgba(245, 158, 11, 0.15)",
              },
              {
                href: "/about",
                icon: FaUser,
                title: "About",
                description: "Get to know me",
                spotlightColor: "rgba(16, 185, 129, 0.15)",
              },
            ].map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <GlassCard
                  href={item.href}
                  className="p-4 md:p-6 h-full relative overflow-hidden group hover:border-accent/30"
                  spotlightColor={item.spotlightColor}
                >
                  <div className="relative z-10 flex flex-col items-center justify-center h-full text-center space-y-3">
                    <div className="text-2xl md:text-3xl text-accent">
                      <item.icon />
                    </div>
                    <div>
                      <h3 className="text-base md:text-lg font-bold mb-1 group-hover:text-accent transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs md:text-sm text-secondary-text group-hover:text-primary-text transition-colors">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.section>
        </main>
        <Footer />
      </div>
    </div>
  );
}
