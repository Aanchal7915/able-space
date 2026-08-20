"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProjectsTable } from "@/components/projects/projects-table";
import { ProjectFieldsMenu } from "@/components/projects/project-fields-menu";
import { ProjectFiltersMenu } from "@/components/projects/project-filters-menu";
import { AddProjectDialog } from "@/components/projects/add-project-dialog";
import { useProjects } from "@/hooks/use-data";
import type { Priority } from "@/lib/types";

export default function ProjectsPage() {
  const { projects, isLoading, mutate } = useProjects();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [priorities, setPriorities] = useState<Priority[]>([]);

  const filtered = useMemo(() => {
    let result = projects;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (priorities.length > 0) {
      result = result.filter((p) => priorities.includes(p.priority));
    }
    return result;
  }, [projects, search, priorities]);

  return (
    <>
      <PageHeader title="Projects">
        {searchOpen ? (
          <Input
            autoFocus
            placeholder="Search projects…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onBlur={() => !search && setSearchOpen(false)}
            className="h-8 w-[180px] sm:w-[220px]"
          />
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-sunken hover:text-foreground"
            aria-label="Search projects"
          >
            <Search className="size-4" />
          </button>
        )}
        <ProjectFieldsMenu />
        <ProjectFiltersMenu priorities={priorities} onChange={setPriorities} />
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
          <ProjectsTable projects={filtered} mutate={mutate} />
        </div>
      )}

      <AddProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} onCreated={mutate} />
    </>
  );
}
