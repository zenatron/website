import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FaHardHat, FaHammer, FaWrench } from 'react-icons/fa';
import Link from 'next/link';

export default function ProjectsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-primary-bg text-primary-text">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-6">
        {/* Animated Icon */}
        <div className="flex flex-col items-center lg:space-y-3 animate-fade-in">
          <div className="flex space-x-4 text-accent animate-bounce">
            <FaHammer className="text-6xl md:text-8xl" />
            <FaWrench className="text-6xl md:text-8xl" />
            <FaHardHat className="text-6xl md:text-8xl" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient-slide p-2">
            {"Projects Under Construction"}
          </h1>
          <p className="text-lg md:text-xl text-muted-text leading-relaxed">
            {"I'm building something amazing! Check back soon for updates on my latest projects."}
          </p>
        </div>

        {/* Call to Action */}
        <div className="mt-8 space-y-4 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row">
          <Link href="/" className="btn btn-primary">{"Return Home"}</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}