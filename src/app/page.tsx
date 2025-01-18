import Header from '../components/Header';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-primary dark:text-white text-gray-800">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <section className="space-y-6 max-w-3xl">
          <h2 className="text-4xl md:text-6xl font-bold">Welcome to My Portfolio</h2>
          <p className="text-lg md:text-xl text-gray-400 leading-relaxed">
            Showcasing my CS projects, blogs, and more.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}