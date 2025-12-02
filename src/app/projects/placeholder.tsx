import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function ProjectsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-primary-bg text-primary-text">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.24em] text-muted-text">
            Projects
          </p>
          <h1 className="text-3xl font-semibold text-primary-text md:text-4xl">
            Work in flight
          </h1>
          <p className="mx-auto max-w-xl text-sm text-secondary-text">
            This space is getting a quieter, more focused showcase of the things I’m shipping. Until then, the highlights on the home page and blog capture the current story.
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 text-sm text-secondary-text sm:flex-row">
          <Link
            href="/"
            className="underline decoration-white/20 underline-offset-4 transition-colors duration-150 hover:text-primary-text"
          >
            Return home
          </Link>
          <span className="hidden text-muted-text sm:inline">/</span>
          <Link
            href="/blog"
            className="underline decoration-white/20 underline-offset-4 transition-colors duration-150 hover:text-primary-text"
          >
            Read the latest notes
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
