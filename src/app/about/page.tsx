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
import ContactButton from "@/components/ui/ContactButton";
// import ContactSection from "@/components/ui/ContactSection";
import { useRef, useState, useEffect } from "react";
import { aboutPhotos } from "@/lib/aboutPhotos";

export default function AboutPage() {
  const containerRef = useRef(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Intersection Observer for section animations
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['photos-bio', 'resume', 'github', 'hobbies'];
      const windowHeight = window.innerHeight;
      const scrollTop = window.scrollY;

      // Check each section to see which one is most visible
      let activeId = 'photos-bio'; // Default to first section

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + scrollTop;

          // If we're past the top of this section
          if (scrollTop + windowHeight * 0.3 >= elementTop) {
            activeId = sectionId;
          }
        }
      }

      setActiveSection(activeId);
    };

    // Use intersection observer as backup for animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Only update if we don't have an active section from scroll
            handleScroll();
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '-20% 0px -20% 0px'
      }
    );

    const sectionElements = document.querySelectorAll('[data-section]');
    sectionElements.forEach((section) => observer.observe(section));

    window.addEventListener('scroll', handleScroll);

    // Set initial state
    handleScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const sections = [
    { id: "photos-bio", title: "About Me", component: PersonalBio },
    { id: "resume", title: "Resume", component: ResumeSection },
    { id: "github", title: "Skills & Tech", component: GitHubReadme },
    { id: "hobbies", title: "Apps & Life", component: HobbiesSection },
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
          className="sticky top-4 z-20 px-6 mb-8"
        >
          <div className="flex justify-center">
            <div className="inline-flex flex-wrap justify-center gap-1 p-1 bg-neutral-800/60 backdrop-blur-md border border-neutral-600/40 rounded-xl shadow-lg">
              {sections.map((section) => (
                <motion.a
                  key={section.id}
                  href={`#${section.id}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
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
        <div className="max-w-7xl mx-auto px-6 space-y-24 pb-8">
          {/* Top Section: Photos + Bio Side by Side */}
          <motion.section
            id="photos-bio"
            data-section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Two-column layout for larger screens */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Photo Gallery - Left Column */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-4"
              >
                <div className="flex justify-center lg:justify-start">
                  <code className="inline-block px-3 py-1.5 bg-neutral-900/80 border border-neutral-700/50 rounded-md text-green-400 font-mono text-lg font-medium">
                    ~ whoami
                  </code>
                </div>
                <PhotoCarousel
                  photos={aboutPhotos}
                  className="w-full"
                  autoPlay={true}
                  autoPlayInterval={6000}
                />
              </motion.div>

              {/* Personal Bio - Right Column */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="space-y-4"
              >
                <div className="flex justify-center lg:justify-start">
                  <code className="inline-block px-3 py-1.5 bg-neutral-900/80 border border-neutral-700/50 rounded-md text-green-400 font-mono text-lg font-medium">
                    ~ history | tail -20
                  </code>
                </div>
                <PersonalBio />
              </motion.div>
            </div>
          </motion.section>

          {/* Resume Section - Glass Card */}
          <motion.section
            id="resume"
            data-section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="bg-neutral-800/25 backdrop-blur-md border border-neutral-600/30 rounded-3xl overflow-hidden shadow-lg">
              <div className="p-8 md:p-12">
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-4">
                    <code className="inline-block px-4 py-2 bg-neutral-900/80 border border-neutral-700/50 rounded-md text-green-400 font-mono text-2xl md:text-3xl font-medium">
                      ~ which skills
                    </code>
                  </div>
                  <p className="text-muted-text max-w-2xl mx-auto">
                    Ready to take the next step? Download my resume or connect with me
                    to discuss opportunities and collaborations.
                  </p>
                </div>
                <ResumeSection />
              </div>
            </div>
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

          {/* Apps, Tools & Hobbies Section */}
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
              <div className="flex justify-center mb-4">
                <code className="inline-block px-4 py-2 bg-neutral-900/80 border border-neutral-700/50 rounded-md text-green-400 font-mono text-2xl md:text-3xl font-medium">
                  ~ top -u phil
                </code>
              </div>
              <p className="text-muted-text max-w-2xl mx-auto">
                The apps, tools, and hobbies that shape my daily routine and creative process.
              </p>
            </div>
            <HobbiesSection />
          </motion.section>
        </div>

        {/* Contact Button at bottom of page */}
        <ContactButton />
      </main>

      <Footer />
      <BackToTopButton />
    </div>
  );
}
