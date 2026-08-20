"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { ProjectsTable } from "@/components/projects/projects-table";
import { AddProjectDialog } from "@/components/projects/add-project-dialog";
import { useProjects } from "@/hooks/use-data";

export default function ProjectsPage() {
  const { projects, isLoading, mutate } = useProjects();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <PageHeader title="Projects">
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="size-3.5" />
          <span className="hidden sm:inline">Add Project</span>
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">Loading projects…</div>
      ) : projects.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm font-medium text-foreground">No projects yet</p>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            <Plus className="size-3.5" />
            Add Project
          </Button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto scrollbar-thin pb-6">
          <ProjectsTable projects={projects} mutate={mutate} />
        </div>
      )}

      <AddProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} onCreated={mutate} />
    </>
  );
}
