import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FaRegSadTear } from 'react-icons/fa';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col bg-primary-bg text-primary-text">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 space-y-6">
        {/* Animated 404 Text */}
        <h1 className="text-8xl font-extrabold animate-pulse">404</h1>

        {/* Icon for Visual Appeal */}
        <FaRegSadTear className="text-muted-text text-6xl animate-bounce" />

        {/* Message */}
        <p className="text-lg md:text-xl text-muted-text">
          {"Oops! The page you're looking for doesn't exist."}
        </p>

        {/* Call to Action */}
        <Link href="/" className="btn btn-primary">
          {"Go Back Home"}
        </Link>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}