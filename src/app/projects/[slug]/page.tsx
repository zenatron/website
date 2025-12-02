import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { FaArrowLeft, FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import { getProjectBySlug } from "@/lib/projects";
import HtmlRenderer from "@/components/HtmlRenderer";
import { redirect } from "next/navigation";
import BackToTopButton from "@/components/BackToTopButton";
import KatexStyles from "@/components/KatexStyles";
import GitHubReadme from "@/components/ui/GitHubReadme";
import ProjectDownloads from "@/components/ui/ProjectDownloads";
import Image from "next/image";
import dateFormatter from "@/utils/dateFormatter";

export async function generateStaticParams() {
  const params = await import("@/lib/projects").then((mod) =>
    mod.generateStaticParams()
  );
  return params;
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    redirect("/projects");
  }

  const { metadata, content, htmlContent, readmeContent, links, downloads } = project;

  return (
    <div className="relative flex min-h-screen flex-col">
      <KatexStyles />
      <Header />
      <main className="flex-1 px-6 py-10 pt-20">
        <div className="max-w-4xl mx-auto">
          {/* Header Navigation */}
          <div className="flex justify-between items-center mb-6">
            <Link
              href="/projects"
              className="inline-flex items-center btn-nav text-sm md:text-base"
              title="Back to Projects"
            >
              <FaArrowLeft className="mr-1 md:mr-2 text-base md:text-lg" />
              Back to Projects
            </Link>

            <div className="flex gap-2 md:gap-4">
              {links?.github && (
                <a
                  href={links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg px-2 md:px-4 py-1.5 
                           text-xs md:text-sm inline-flex items-center gap-2
                           hover:bg-white/10 hover:border-white/20 shadow-lg transition-all duration-300"
                  title="View on GitHub"
                >
                  <FaGithub />
                  <span className="hidden sm:inline">GitHub</span>
                </a>
              )}
              {links?.live && (
                <a
                  href={links.live}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg px-2 md:px-4 py-1.5 
                           text-xs md:text-sm inline-flex items-center gap-2
                           hover:bg-white/10 hover:border-white/20 shadow-lg transition-all duration-300"
                  title="View Live Demo"
                >
                  <FaExternalLinkAlt />
                  <span className="hidden sm:inline">Live Demo</span>
                </a>
              )}
              {downloads && downloads.length > 0 && (
                <ProjectDownloads downloads={downloads} projectTitle={metadata.title} />
              )}
            </div>
          </div>

          {/* Project Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {metadata.title}
            </h1>
            {metadata.date && (
              <p className="text-muted-text mb-2">
                {dateFormatter({ date: metadata.date, formatStyle: "long" })}
              </p>
            )}
            <p className="text-lg text-muted-text mb-4 max-w-3xl mx-auto">
              {metadata.description}
            </p>
            {metadata.tags && metadata.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {metadata.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/projects?tag=${encodeURIComponent(tag)}`}
                    className="tag-bubble text-sm"
                    title={`View projects with tag: ${tag}`}
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Featured Image */}
          {metadata.image && (
            <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
              <Image
                src={metadata.image}
                alt={metadata.title}
                width={800}
                height={400}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Featured Video */}
          {metadata.video && (
            <div className="mb-8 rounded-lg overflow-hidden shadow-lg aspect-video">
              {metadata.video.includes("youtube.com") || metadata.video.includes("youtu.be") ? (
                <iframe
                  src={metadata.video.replace("watch?v=", "embed/")}
                  title={metadata.title}
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : (
                <video
                  src={metadata.video}
                  controls
                  className="w-full h-full"
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          )}

          {/* Content Based on Source Type */}
          {/* MDX Content (including notebooks with custom MDX) */}
          {(metadata.contentSource === "mdx" || metadata.contentSource === "notebook") && content && (
            <>
              <div className="mdx-content w-full max-w-3xl mx-auto mb-8">
                {content}
              </div>
              
              {/* If this is an enhanced GitHub project, also show the README */}
              {metadata.githubRepo && (
                <div className="mt-8 w-full">
                  <h2 className="text-3xl font-bold mb-4">Repository README</h2>
                  <GitHubReadme repo={metadata.githubRepo} />
                </div>
              )}
            </>
          )}

          {/* GitHub README Only (no MDX file) */}
          {metadata.contentSource === "github" && metadata.githubRepo && (
            <div className="w-full">
              <GitHubReadme repo={metadata.githubRepo} />
            </div>
          )}

          {/* Raw HTML (for legacy or non-MDX HTML content) */}
          {metadata.contentSource === "html" && htmlContent && (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <HtmlRenderer
                htmlContent={htmlContent}
                title={metadata.title}
              />
            </div>
          )}

          {/* Image Gallery */}
          {metadata.images && metadata.images.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Gallery</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {metadata.images.map((image, index) => (
                  <div key={index} className="rounded-lg overflow-hidden shadow-lg">
                    <Image
                      src={image}
                      alt={`${metadata.title} - Image ${index + 1}`}
                      width={400}
                      height={300}
                      className="w-full h-auto"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video Gallery */}
          {metadata.videos && metadata.videos.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">Videos</h2>
              <div className="grid grid-cols-1 gap-4">
                {metadata.videos.map((video, index) => (
                  <div key={index} className="rounded-lg overflow-hidden shadow-lg aspect-video">
                    {video.includes("youtube.com") || video.includes("youtu.be") ? (
                      <iframe
                        src={video.replace("watch?v=", "embed/")}
                        title={`${metadata.title} - Video ${index + 1}`}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={video}
                        controls
                        className="w-full h-full"
                      >
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <BackToTopButton />
    </div>
  );
}
