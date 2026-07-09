"use client";

import { useTaskSummary } from "@/hooks/useTasks";

interface TaskSummaryChipsProps {
  // overdue is computed on the page from the visible tasks (the summary API
  // doesn't return it), so it's passed in rather than read from the query.
  overdue: number;
}

const TaskSummaryChips = ({ overdue }: TaskSummaryChipsProps) => {
  const { data } = useTaskSummary();

  if (!data) return null;

  const chips = [
    { label: "Total", value: data.total, dot: "bg-foreground" },
    { label: "To do", value: data.todo, dot: "bg-status-todo-fg" },
    {
      label: "In progress",
      value: data.inProgress,
      dot: "bg-status-progress-fg",
    },
    { label: "Done", value: data.done, dot: "bg-status-done-fg" },
    { label: "Overdue", value: overdue, dot: "bg-status-overdue-fg" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
      {chips.map((chip) => (
        <div
          key={chip.label}
          className={
            // mobile: compact row (label left, number right).
            // sm+: taller card with the big serif number stacked below the label.
            "flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-3 py-2.5 shadow-sm " +
            "sm:flex-col sm:items-start sm:justify-start sm:gap-1 sm:rounded-2xl sm:p-4"
          }
        >
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${chip.dot}`} />
            <span className="truncate">{chip.label}</span>
          </div>
          <div className="font-serif text-2xl leading-none text-foreground sm:text-4xl">
            {chip.value}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskSummaryChips;
