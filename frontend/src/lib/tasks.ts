import type { Task, TaskStatus } from "@/types/task";

export const STATUS_ORDER: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

// how urgent a task's due date is, used to colour the due-date text.
// done tasks are never flagged; "soon" = due today or tomorrow.
export type DueUrgency = "overdue" | "soon" | "normal";

export const getDueUrgency = (task: Task): DueUrgency => {
  if (task.status === "DONE") return "normal";
  const now = new Date();
  const due = new Date(task.dueDate);
  if (due.getTime() < now.getTime()) return "overdue";

  const endOfTomorrow = new Date(now);
  endOfTomorrow.setDate(now.getDate() + 1);
  endOfTomorrow.setHours(23, 59, 59, 999);
  if (due.getTime() <= endOfTomorrow.getTime()) return "soon";

  return "normal";
};

// count of not-done tasks whose due date has passed
export const countOverdue = (tasks: Task[]): number =>
  tasks.filter((t) => getDueUrgency(t) === "overdue").length;

// short relative-ish label for compact places (board cards)
export const formatDueShort = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};
