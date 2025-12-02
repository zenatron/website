"use client";

import ProjectsClient from "@/components/layouts/ProjectsClient";
import { ProjectCard } from "@/types/types";

export default function ProjectsLayout({
  projects,
}: {
  projects: ProjectCard[];
}) {
  return (
    <main className="flex-1 relative overflow-hidden">
      <ProjectsClient projects={projects} />
    </main>
  );
}
