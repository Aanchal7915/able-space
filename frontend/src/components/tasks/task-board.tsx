"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { STATUS_COLUMNS, type Task, type TaskStatus } from "@/lib/types";
import { TaskColumn } from "./task-column";
import { TaskCard } from "./task-card";
import { api } from "@/lib/api";

export function TaskBoard({
  tasks,
  mutate,
}: {
  tasks: Task[];
  mutate: (updater?: (current: Task[] | undefined) => Task[] | undefined, revalidate?: boolean) => void;
}) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const columns = STATUS_COLUMNS.map((col) => ({
    ...col,
    tasks: tasks.filter((t) => t.status === col.id).sort((a, b) => a.order - b.order),
  }));

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    setActiveTask(task ?? null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeTaskItem = tasks.find((t) => t.id === active.id);
    if (!activeTaskItem) return;

    const overIsColumn = STATUS_COLUMNS.some((c) => c.id === over.id);
    const targetStatus: TaskStatus = overIsColumn
      ? (over.id as TaskStatus)
      : tasks.find((t) => t.id === over.id)?.status ?? activeTaskItem.status;

    const columnTasks = tasks
      .filter((t) => t.status === targetStatus && t.id !== activeTaskItem.id)
      .sort((a, b) => a.order - b.order);

    let insertIndex = columnTasks.length;
    if (!overIsColumn) {
      const overIndex = columnTasks.findIndex((t) => t.id === over.id);
      if (overIndex !== -1) insertIndex = overIndex;
    }
    columnTasks.splice(insertIndex, 0, { ...activeTaskItem, status: targetStatus });

    const reordered = columnTasks.map((t, idx) => ({ ...t, order: idx }));

    mutate((current) => {
      if (!current) return current;
      const untouched = current.filter((t) => !reordered.some((r) => r.id === t.id));
      return [...untouched, ...reordered];
    }, false);

    const newOrder = reordered.findIndex((t) => t.id === activeTaskItem.id);
    try {
      await api.patch(`/tasks/${activeTaskItem.id}`, { status: targetStatus, order: newOrder });
    } finally {
      mutate();
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full gap-4 overflow-x-auto scrollbar-thin px-4 pb-4 pt-3">
        {columns.map((col) => (
          <TaskColumn key={col.id} status={col.id} label={col.label} tasks={col.tasks} />
        ))}
      </div>
      <DragOverlay>{activeTask && <div className="w-[280px]"><TaskCard task={activeTask} /></div>}</DragOverlay>
    </DndContext>
  );
}
