"use client";

import { SlidersHorizontal } from "lucide-react";
import { useUIStore, type ProjectFieldKey } from "@/lib/ui-store";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const FIELD_LABELS: { key: ProjectFieldKey; label: string }[] = [
  { key: "priority", label: "Priority" },
  { key: "lead", label: "Lead" },
  { key: "dueDate", label: "Due Date" },
  { key: "taskCount", label: "Tasks" },
];

export function ProjectFieldsMenu() {
  const { visibleProjectFields, toggleProjectField } = useUIStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <SlidersHorizontal className="size-3.5" />
          Fields
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px]">
        <DropdownMenuLabel>Visible fields</DropdownMenuLabel>
        {FIELD_LABELS.map((f) => (
          <DropdownMenuCheckboxItem
            key={f.key}
            checked={visibleProjectFields[f.key]}
            onCheckedChange={() => toggleProjectField(f.key)}
          >
            {f.label}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
