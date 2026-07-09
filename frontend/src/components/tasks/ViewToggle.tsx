"use client";

import { LayoutGrid, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type TaskView = "table" | "board";

interface ViewToggleProps {
  view: TaskView;
  onChange: (view: TaskView) => void;
}

const OPTIONS: { value: TaskView; label: string; icon: typeof Table2 }[] = [
  { value: "table", label: "Table", icon: Table2 },
  { value: "board", label: "Board", icon: LayoutGrid },
];

const ViewToggle = ({ view, onChange }: ViewToggleProps) => (
  <div className="inline-flex rounded-xl border border-border bg-secondary p-1">
    {OPTIONS.map((opt) => {
      const Icon = opt.icon;
      const active = view === opt.value;
      return (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          aria-pressed={active}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
            active
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className="h-4 w-4" />
          {opt.label}
        </button>
      );
    })}
  </div>
);

export default ViewToggle;
