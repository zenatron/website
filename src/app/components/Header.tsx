import Link from 'next/link';

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-2 bg-secondary">
      <h1 className="text-xl font-bold">Philip Vishnevsky</h1>
      <nav className="flex items-center space-x-4">
        <Link href="/projects" className="btn btn-primary">
          View Projects
        </Link>
        <Link href="/blog" className="btn btn-secondary">
          Read Blog
        </Link>
        <Link href="/about" className="btn btn-secondary">
          About Me
        </Link>
      </nav>
    </header>
  );
}