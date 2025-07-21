"use client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTopButton from "@/components/BackToTopButton";
import { motion } from "framer-motion";
import Squares from "@/components/ui/Squares";
import GradientText from "@/components/ui/GradientText";
import VariableProximity from "@/components/ui/VariableProximity";
import PhotoCarousel from "@/components/ui/PhotoCarousel";
import PersonalBio from "@/components/ui/PersonalBio";
import GitHubReadme from "@/components/ui/GitHubReadme";
import HobbiesSection from "@/components/ui/HobbiesSection";
import ResumeSection from "@/components/ui/ResumeSection";
// import ContactSection from "@/components/ui/ContactSection";
import { useRef, useState, useEffect } from "react";
import { aboutPhotos } from "@/lib/aboutPhotos";

export default function AboutPage() {
  const containerRef = useRef(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Intersection Observer for section animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    const sections = document.querySelectorAll('[data-section]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const sections = [
    { id: "photos", title: "Photos", component: PhotoCarousel },
    { id: "bio", title: "About Me", component: PersonalBio },
    { id: "resume", title: "Resume", component: ResumeSection },
    { id: "github", title: "Skills & Tech", component: GitHubReadme },
    { id: "hobbies", title: "Hobbies", component: HobbiesSection },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-transparent">
      <Header />

      {/* Background */}
      <div className="fixed inset-0 z-0">
        <Squares direction="diagonal" speed={0.2} squareSize={96} />
      </div>

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center text-center px-6 pb-20 pt-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
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
                animationSpeed={24}
                transparent={true}
                colors={["#227be0", "#9c40ff", "#ffaa40", "#227be0"]}
              >
                <VariableProximity
                  label="About Me"
                  className="text-5xl md:text-7xl font-bold"
                  fromFontVariationSettings="'wght' 100, 'opsz' 8"
                  toFontVariationSettings="'wght' 900, 'opsz' 48"
                  containerRef={
                    containerRef as unknown as React.RefObject<HTMLElement>
                  }
                  radius={120}
                  falloff="gaussian"
                />
              </GradientText>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-lg md:text-xl text-muted-text leading-relaxed max-w-2xl mx-auto"
            >
              Welcome to my world! Discover my journey, skills, passions, and what drives me
              as a software engineer and creative problem solver.
            </motion.p>
          </motion.div>
        </section>

        {/* Navigation Pills */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="sticky top-20 z-20 px-6 mb-12"
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap justify-center gap-2 p-4 bg-neutral-800/50 backdrop-blur-md border border-neutral-600/30 rounded-2xl shadow-lg">
              {sections.map((section) => (
                <motion.a
                  key={section.id}
                  href={`#${section.id}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeSection === section.id
                      ? "bg-accent text-white shadow-lg"
                      : "text-muted-text hover:text-primary-text hover:bg-neutral-700/50"
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(section.id)?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }}
                >
                  {section.title}
                </motion.a>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Content Sections */}
        <div className="max-w-6xl mx-auto px-6 space-y-24 pb-24">
          {/* Photo Carousel Section */}
          <motion.section
            id="photos"
            data-section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-text mb-4">
                A Glimpse Into My World
              </h2>
              <p className="text-muted-text max-w-2xl mx-auto">
                Here are some moments that capture who I am - from professional settings
                to personal adventures and everything in between.
              </p>
            </div>
            <PhotoCarousel
              photos={aboutPhotos}
              className="max-w-4xl mx-auto"
              autoPlay={true}
              autoPlayInterval={6000}
            />
          </motion.section>

          {/* Personal Bio Section */}
          <motion.section
            id="bio"
            data-section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-text mb-4">
                My Story
              </h2>
              <p className="text-muted-text max-w-2xl mx-auto">
                Every developer has a unique journey. Here's mine - the experiences,
                motivations, and philosophy that shape how I approach technology and life.
              </p>
            </div>
            <PersonalBio />
          </motion.section>

          {/* Resume Section */}
          <motion.section
            id="resume"
            data-section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-text mb-4">
                Professional Profile
              </h2>
              <p className="text-muted-text max-w-2xl mx-auto">
                Ready to take the next step? Download my resume or connect with me
                to discuss opportunities and collaborations.
              </p>
            </div>
            <ResumeSection />
          </motion.section>

          {/* Skills & Tech Section */}
          <motion.section
            id="github"
            data-section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <GitHubReadme />
          </motion.section>

          {/* Hobbies Section */}
          <motion.section
            id="hobbies"
            data-section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-text mb-4">
                Beyond Code
              </h2>
              <p className="text-muted-text max-w-2xl mx-auto">
                Life is about balance. When I'm not coding, you'll find me exploring these
                passions that keep me inspired and energized.
              </p>
            </div>
            <HobbiesSection />
          </motion.section>
        </div>
      </main>

      <Footer />
      <BackToTopButton />
    </div>
  );
}
