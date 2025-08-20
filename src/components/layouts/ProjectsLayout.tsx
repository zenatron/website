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
      {/* Content */}
      <div className="relative z-10 px-6 py-10">
        <ProjectsClient projects={projects} />
      </div>
    </main>
  );
}
