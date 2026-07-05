"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useTaskSummary } from "@/hooks/useTasks";

const chips = [
  { key: "total", label: "Total", accent: "text-foreground" },
  { key: "todo", label: "To do", accent: "text-slate-600" },
  { key: "inProgress", label: "In progress", accent: "text-blue-600" },
  { key: "done", label: "Done", accent: "text-green-600" },
] as const;

const TaskSummaryChips = () => {
  const { data } = useTaskSummary();

  if (!data) return null;

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {chips.map((chip) => (
        <Card key={chip.key} className="py-3">
          <CardContent className="px-4">
            <div className={`text-2xl font-bold ${chip.accent}`}>
              {data[chip.key]}
            </div>
            <div className="text-xs text-muted-foreground">{chip.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TaskSummaryChips;
