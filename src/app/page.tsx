import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ArrowUpRight, MapPin, Briefcase, Clock } from "lucide-react";
import { getAllProjects } from "@/lib/projects";
import { getAllBlogPosts } from "@/lib/blog";
import dateFormatter from "@/utils/dateFormatter";
import HomeHero from "@/components/home/HomeHero";
import QuoteCarousel from "@/components/home/QuoteCarousel";

const QUICK_FACTS = [
  { label: "Location", value: "Charlotte, NC", icon: MapPin },
  { label: "Foci", value: "SWE · AI · Games", icon: Briefcase },
  { label: "Status", value: "Open to opportunities", icon: Clock },
];

export default async function HomePage() {
  // Fetch real data
  const [projects, posts] = await Promise.all([
    getAllProjects(),
    getAllBlogPosts(),
  ]);

  // Get 3 most recent projects (sorted by date)
  const recentProjects = projects
    .filter((p) => p.metadata.date)
    .sort((a, b) => new Date(b.metadata.date!).getTime() - new Date(a.metadata.date!).getTime())
    .slice(0, 3);

  // Get most recent blog post
  const latestPost = posts
    .sort((a, b) => new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime())[0];

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section - Editorial style */}
        <section className="relative overflow-hidden px-4 pb-24 pt-32 sm:px-6 md:pt-40">
          {/* Subtle accent line */}
          <div className="absolute left-1/2 top-0 h-32 w-px -translate-x-1/2 bg-gradient-to-b from-accent/40 to-transparent" />
          
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-16 lg:grid-cols-[1fr,320px]">
              {/* Main content */}
              <HomeHero />

              {/* Sidebar card */}
              <aside className="relative">
                <div className="sticky top-32 space-y-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <span className="status-dot" />
                    <span className="text-sm text-secondary-text">Available for work</span>
                  </div>
                  
                  <div className="divider" />
                  
                  <ul className="space-y-4">
                    {QUICK_FACTS.map((fact) => (
                      <li key={fact.label} className="flex items-start gap-3">
                        <fact.icon className="mt-0.5 h-4 w-4 text-muted-text" />
                        <div>
                          <p className="text-xs uppercase tracking-wider text-muted-text">{fact.label}</p>
                          <p className="text-sm text-primary-text">{fact.value}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="divider" />
                  
                  <Link 
                    href="mailto:phil@underscore.games"
                    className="link-subtle block text-sm"
                  >
                    phil@underscore.games
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Recent Projects Section */}
        <section className="px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 flex items-end justify-between">
              <div>
                <p className="mb-2 text-sm font-medium tracking-[0.2em] text-accent">
                  RECENT WORK
                </p>
                <h2 className="text-3xl tracking-tight md:text-4xl">
                  Latest projects
                </h2>
              </div>
              <Link 
                href="/projects" 
                className="link-subtle hidden text-sm md:inline-flex md:items-center md:gap-2"
              >
                View all
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-1">
              {recentProjects.map((project, index) => (
                <Link
                  key={project.metadata.slug}
                  href={`/projects/${project.metadata.slug}`}
                  className="group relative block"
                >
                  <div className="flex items-start gap-6 rounded-xl px-4 py-6 transition-colors duration-150 hover:bg-white/[0.02] md:items-center">
                    {/* Index number */}
                    <span className="hidden w-8 text-sm tabular-nums text-muted-text md:block">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    
                    {/* Main content */}
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h3 className="text-lg font-medium text-primary-text transition-colors group-hover:text-accent">
                          {project.metadata.title}
                        </h3>
                        <span className="text-sm capitalize text-muted-text">
                          {project.metadata.type}
                        </span>
                      </div>
                      <p className="text-sm text-secondary-text line-clamp-1">
                        {project.metadata.description}
                      </p>
                    </div>
                    
                    {/* Tags */}
                    <div className="hidden items-center gap-3 md:flex">
                      {project.metadata.tags?.slice(0, 3).map((tag) => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                    
                    {/* Year */}
                    <span className="text-sm tabular-nums text-muted-text">
                      {project.metadata.date ? new Date(project.metadata.date).getFullYear() : ""}
                    </span>
                    
                    {/* Arrow */}
                    <ArrowUpRight className="h-4 w-4 text-muted-text opacity-0 transition-all duration-150 group-hover:text-accent group-hover:opacity-100" />
                  </div>
                  
                  {/* Divider */}
                  {index < recentProjects.length - 1 && (
                    <div className="mx-4 h-px bg-white/[0.04]" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Writing preview */}
        <section className="px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-12 lg:grid-cols-2">
              <div className="space-y-6">
                <p className="text-sm font-medium tracking-[0.2em] text-accent">
                  WRITING
                </p>
                <h2 className="text-3xl tracking-tight md:text-4xl">
                  Writing
                </h2>
                <p className="text-secondary-text">
                  Sometimes I write things down. Mostly about code.
                </p>
                <Link 
                  href="/blog" 
                  className="btn btn-secondary inline-flex"
                >
                  Read the blog
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
              
              {latestPost && (
                <Link 
                  href={`/blog/${latestPost.slug}`}
                  className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 transition-colors hover:border-white/[0.1] hover:bg-white/[0.03]"
                >
                  <div className="absolute -top-3 left-6 bg-primary-bg px-2 text-xs uppercase tracking-wider text-muted-text">
                    Latest
                  </div>
                  <div className="space-y-4">
                    <p className="text-xs text-muted-text">
                      {dateFormatter({ date: latestPost.metadata.date, month: "long", year: "numeric" })}
                    </p>
                    <h3 className="text-xl font-medium text-primary-text transition-colors group-hover:text-accent">
                      {latestPost.metadata.title}
                    </h3>
                    {latestPost.metadata.excerpt && (
                      <p className="text-sm text-secondary-text line-clamp-3">
                        {latestPost.metadata.excerpt}
                      </p>
                    )}
                    <span className="link-subtle inline-flex items-center gap-2 text-sm">
                      Continue reading
                      <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Philosophy section */}
        <section className="px-4 py-24 sm:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <QuoteCarousel />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
