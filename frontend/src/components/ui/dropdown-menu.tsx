"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuGroup = DropdownMenuPrimitive.Group;
export const DropdownMenuSub = DropdownMenuPrimitive.Sub;
export const DropdownMenuSubTrigger = ({
  className,
  children,
  ...props
}: DropdownMenuPrimitive.DropdownMenuSubTriggerProps) => (
  <DropdownMenuPrimitive.SubTrigger
    className={cn(
      "flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] outline-none cursor-pointer text-foreground data-[state=open]:bg-surface-sunken hover:bg-surface-sunken",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto size-3.5 text-muted-foreground" />
  </DropdownMenuPrimitive.SubTrigger>
);

export const DropdownMenuContent = ({
  className,
  sideOffset = 6,
  ...props
}: DropdownMenuPrimitive.DropdownMenuContentProps) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[180px] overflow-hidden rounded-lg border border-border bg-surface p-1 shadow-lg animate-fade-in",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
);

export const DropdownMenuSubContent = ({
  className,
  ...props
}: DropdownMenuPrimitive.DropdownMenuSubContentProps) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.SubContent
      className={cn(
        "z-50 min-w-[170px] overflow-hidden rounded-lg border border-border bg-surface p-1 shadow-lg animate-fade-in",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
);

export const DropdownMenuItem = ({
  className,
  ...props
}: DropdownMenuPrimitive.DropdownMenuItemProps) => (
  <DropdownMenuPrimitive.Item
    className={cn(
      "flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] outline-none cursor-pointer text-foreground hover:bg-surface-sunken data-[highlighted]:bg-surface-sunken",
      className
    )}
    {...props}
  />
);

export const DropdownMenuCheckboxItem = ({
  className,
  children,
  checked,
  onSelect,
  ...props
}: DropdownMenuPrimitive.DropdownMenuCheckboxItemProps) => (
  <DropdownMenuPrimitive.CheckboxItem
    checked={checked}
    // Checkbox items represent a multi-select toggle (Fields, Filters) — the
    // menu should stay open across multiple picks, unlike a regular Item
    // that performs a single navigating/triggering action.
    onSelect={(event) => {
      event.preventDefault();
      onSelect?.(event);
    }}
    className={cn(
      "flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] outline-none cursor-pointer text-foreground hover:bg-surface-sunken data-[highlighted]:bg-surface-sunken",
      className
    )}
    {...props}
  >
    <span className="flex-1">{children}</span>
    {checked && <Check className="size-3.5 text-accent" />}
  </DropdownMenuPrimitive.CheckboxItem>
);

export const DropdownMenuLabel = ({
  className,
  ...props
}: DropdownMenuPrimitive.DropdownMenuLabelProps) => (
  <DropdownMenuPrimitive.Label
    className={cn("px-2 py-1.5 text-[11px] font-medium text-muted-foreground", className)}
    {...props}
  />
);

export const DropdownMenuSeparator = ({
  className,
  ...props
}: DropdownMenuPrimitive.DropdownMenuSeparatorProps) => (
  <DropdownMenuPrimitive.Separator className={cn("my-1 h-px bg-border", className)} {...props} />
);
