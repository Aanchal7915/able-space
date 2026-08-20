"use client";

import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { FieldsMenu } from "@/components/tasks/fields-menu";
import { ViewToggle } from "@/components/tasks/view-toggle";
import { TaskBoard } from "@/components/tasks/task-board";
import { TaskListView } from "@/components/tasks/task-list-view";
import { AddTaskDialog } from "@/components/tasks/add-task-dialog";
import { TaskDetailDrawer } from "@/components/tasks/task-detail-drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTasks } from "@/hooks/use-data";
import { useUIStore } from "@/lib/ui-store";

export default function TasksPage() {
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const { tasks, mutate, isLoading } = useTasks({ search: search || undefined });
  const viewMode = useUIStore((s) => s.viewMode);
  const setAddTaskDialogOpen = useUIStore((s) => s.setAddTaskDialogOpen);

  return (
    <>
      <PageHeader title="Tasks">
        {searchOpen ? (
          <div className="flex items-center gap-1.5">
            <Input
              autoFocus
              placeholder="Search tasks…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onBlur={() => !search && setSearchOpen(false)}
              className="h-8 w-[180px] sm:w-[220px]"
            />
          </div>
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
        <EmptyState onAdd={() => setAddTaskDialogOpen(true, "todo")} />
      ) : viewMode === "board" ? (
        <TaskBoard tasks={tasks} mutate={mutate} />
      ) : (
        <TaskListView tasks={tasks} />
      )}

      <AddTaskDialog />
      <TaskDetailDrawer />
    </>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-sm font-medium text-foreground">No tasks yet</p>
      <p className="max-w-xs text-[13px] text-muted-foreground">Create your first task to start tracking work for this workspace.</p>
      <Button size="sm" onClick={onAdd}>
        <Plus className="size-3.5" />
        Add Task
      </Button>
    </div>
  );
}
