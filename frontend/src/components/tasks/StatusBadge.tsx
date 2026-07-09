import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/types/task";

// shared status meta — label, soft pill colors and the leading dot color.
// exported so the board columns and summary chips stay in sync with the pills.
export const STATUS_META: Record<
  TaskStatus,
  { label: string; pill: string; dot: string }
> = {
  TODO: {
    label: "To do",
    pill: "bg-status-todo-bg text-status-todo-fg",
    dot: "bg-status-todo-fg",
  },
  IN_PROGRESS: {
    label: "In progress",
    pill: "bg-status-progress-bg text-status-progress-fg",
    dot: "bg-status-progress-fg",
  },
  DONE: {
    label: "Done",
    pill: "bg-status-done-bg text-status-done-fg",
    dot: "bg-status-done-fg",
  },
};

const StatusBadge = ({
  status,
  className,
}: {
  status: TaskStatus;
  className?: string;
}) => {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        meta.pill,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
};

export default StatusBadge;
