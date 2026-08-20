"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ChevronRight, Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { FieldsMenu } from "@/components/tasks/fields-menu";
import { ViewToggle } from "@/components/tasks/view-toggle";
import { TaskBoard } from "@/components/tasks/task-board";
import { TaskListView } from "@/components/tasks/task-list-view";
import { AddTaskDialog } from "@/components/tasks/add-task-dialog";
import { TaskDetailDrawer } from "@/components/tasks/task-detail-drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProject, useTasks } from "@/hooks/use-data";
import { useUIStore } from "@/lib/ui-store";

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { project } = useProject(id);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const { tasks, mutate, isLoading } = useTasks({ projectId: id, search: search || undefined });
  const viewMode = useUIStore((s) => s.viewMode);
  const setAddTaskDialogOpen = useUIStore((s) => s.setAddTaskDialogOpen);

  return (
    <>
      <PageHeader
        title={project?.name ?? "Project"}
        breadcrumb={
          <span className="hidden items-center gap-1 text-[13px] text-muted-foreground sm:flex">
            <Link href="/projects" className="hover:text-foreground">
              Projects
            </Link>
            <ChevronRight className="size-3.5" />
          </span>
        }
      >
        {searchOpen ? (
          <Input
            autoFocus
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onBlur={() => !search && setSearchOpen(false)}
            className="h-8 w-[180px] sm:w-[220px]"
          />
        ) : (
          <button onClick={() => setSearchOpen(true)} className="rounded-md p-1.5 text-muted-foreground hover:bg-surface-sunken hover:text-foreground">
            <Search className="size-4" />
          </button>
        )}
        <FieldsMenu />
        <ViewToggle />
        <Button size="sm" onClick={() => setAddTaskDialogOpen(true, "todo")}>
          <Plus className="size-3.5" />
          <span className="hidden sm:inline">Add Task</span>
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">Loading tasks…</div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm font-medium text-foreground">No tasks in this project yet</p>
          <Button size="sm" onClick={() => setAddTaskDialogOpen(true, "todo")}>
            <Plus className="size-3.5" />
            Add Task
          </Button>
        </div>
      ) : viewMode === "board" ? (
        <TaskBoard tasks={tasks} mutate={mutate} />
      ) : (
        <TaskListView tasks={tasks} />
      )}

      <AddTaskDialog projectId={id} />
      <TaskDetailDrawer />
    </>
  );
}
