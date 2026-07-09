"use client";

import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import StatusBadge from "./StatusBadge";
import OwnerChip from "./OwnerChip";
import { formatDate, cn } from "@/lib/utils";
import { getDueUrgency } from "@/lib/tasks";
import type { Task } from "@/types/task";

interface TaskTableProps {
  tasks: Task[];
  //owner column only makes sense for admins, users always see their own tasks
  showOwner: boolean;
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const urgencyClass: Record<string, string> = {
  overdue: "text-status-overdue-fg font-semibold",
  soon: "text-status-progress-fg font-semibold",
  normal: "text-muted-foreground",
};

const TaskTable = ({
  tasks,
  showOwner,
  onView,
  onEdit,
  onDelete,
}: TaskTableProps) => (
  <>
    {/* desktop / tablet: real table inside a card */}
    <div className="hidden overflow-hidden rounded-2xl border border-border bg-card shadow-sm sm:block">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground">Title</TableHead>
            <TableHead className="text-muted-foreground">Status</TableHead>
            <TableHead className="text-muted-foreground">Due date</TableHead>
            {showOwner && (
              <TableHead className="text-muted-foreground">Owner</TableHead>
            )}
            <TableHead className="w-30 text-right text-muted-foreground">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id} className="border-border">
              <TableCell
                className="max-w-70 cursor-pointer truncate font-semibold text-foreground"
                onClick={() => onView(task)}
              >
                {task.title}
              </TableCell>
              <TableCell>
                <StatusBadge status={task.status} />
              </TableCell>
              <TableCell
                className={cn("text-sm", urgencyClass[getDueUrgency(task)])}
              >
                {formatDate(task.dueDate)}
              </TableCell>
              {showOwner && (
                <TableCell>
                  <OwnerChip name={task.owner.userName} />
                </TableCell>
              )}
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => onView(task)}
                    title="View"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => onEdit(task)}
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 hover:bg-status-overdue-bg hover:text-destructive"
                    onClick={() => onDelete(task)}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>

    {/* mobile: stacked cards */}
    <div className="space-y-3 sm:hidden">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="rounded-2xl border border-border bg-card p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <button
              type="button"
              onClick={() => onView(task)}
              className="text-left font-semibold text-foreground"
            >
              {task.title}
            </button>
            <StatusBadge status={task.status} />
          </div>
          <p
            className={cn(
              "mt-2 text-sm",
              urgencyClass[getDueUrgency(task)],
            )}
          >
            {formatDate(task.dueDate)}
          </p>
          <div className="mt-3 flex items-center justify-between">
            {showOwner ? (
              <OwnerChip name={task.owner.userName} />
            ) : (
              <span />
            )}
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={() => onEdit(task)}
                title="Edit"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 hover:bg-status-overdue-bg hover:text-destructive"
                onClick={() => onDelete(task)}
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </>
);

export default TaskTable;
