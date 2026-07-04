import { Badge } from "@/components/ui/badge";
import type { TaskStatus } from "@/types/task";

const statusStyles: Record<TaskStatus, string> = {
  TODO: "bg-slate-100 text-slate-700 border-slate-200",
  IN_PROGRESS: "bg-blue-100 text-blue-700 border-blue-200",
  DONE: "bg-green-100 text-green-700 border-green-200",
};

const statusLabels: Record<TaskStatus, string> = {
  TODO: "To do",
  IN_PROGRESS: "In progress",
  DONE: "Done",
};

const StatusBadge = ({ status }: { status: TaskStatus }) => (
  <Badge variant="outline" className={statusStyles[status]}>
    {statusLabels[status]}
  </Badge>
);

export default StatusBadge;
