import ProjectsLayout from "@/components/layouts/ProjectsLayout";
import { getGithubRepos } from "@/lib/github";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAllProjects } from "@/lib/projects";
import BackToTopButton from "@/components/ui/BackToTopButton";
import { Suspense } from "react";
import ClientSkeletonLoader from "@/components/ui/ClientSkeletonLoader";

export default async function ProjectsPage() {
  const githubProjects = await getGithubRepos();
  const dataProjects = await getAllProjects();
  const allProjects = [...dataProjects, ...githubProjects];

  return (
    <div className="relative flex min-h-screen flex-col">
      <Header />
      <Suspense fallback={<ClientSkeletonLoader layout="grid" />}>
        <ProjectsLayout projects={allProjects} />
      </Suspense>
      <Footer />
      <BackToTopButton />
    </div>
  );
}
