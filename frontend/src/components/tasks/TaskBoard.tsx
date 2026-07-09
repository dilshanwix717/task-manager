"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { STATUS_META } from "./StatusBadge";
import OwnerChip from "./OwnerChip";
import { STATUS_ORDER, getDueUrgency, formatDueShort } from "@/lib/tasks";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus } from "@/types/task";

interface TaskBoardProps {
  tasks: Task[];
  showOwner: boolean;
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (task: Task, status: TaskStatus) => void;
}

const urgencyClass: Record<string, string> = {
  overdue: "text-status-overdue-fg font-semibold",
  soon: "text-status-progress-fg font-semibold",
  normal: "text-muted-foreground",
};

const TaskBoard = ({
  tasks,
  showOwner,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskBoardProps) => {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<TaskStatus | null>(null);

  const moveBy = (task: Task, dir: -1 | 1) => {
    const idx = STATUS_ORDER.indexOf(task.status);
    const next = STATUS_ORDER[idx + dir];
    if (next) onStatusChange(task, next);
  };

  const handleDrop = (status: TaskStatus) => {
    const task = tasks.find((t) => t.id === dragId);
    if (task && task.status !== status) onStatusChange(task, status);
    setDragId(null);
    setOverCol(null);
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {STATUS_ORDER.map((status) => {
        const meta = STATUS_META[status];
        const columnTasks = tasks.filter((t) => t.status === status);
        const isOver = overCol === status;

        return (
          <div
            key={status}
            onDragOver={(e) => {
              e.preventDefault();
              setOverCol(status);
            }}
            onDragLeave={() => setOverCol((c) => (c === status ? null : c))}
            onDrop={() => handleDrop(status)}
            className={cn(
              "flex flex-col rounded-2xl border bg-surface p-3 transition-colors",
              isOver
                ? "border-primary bg-primary-tint/50"
                : "border-border",
            )}
          >
            <div className="mb-3 flex items-center gap-2 px-1">
              <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
              <span className="text-sm font-bold text-foreground">
                {meta.label}
              </span>
              <span className="ml-auto rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                {columnTasks.length}
              </span>
            </div>

            <div className="flex-1 space-y-2.5">
              {columnTasks.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
                  Nothing here
                </p>
              ) : (
                columnTasks.map((task) => {
                  const idx = STATUS_ORDER.indexOf(task.status);
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => setDragId(task.id)}
                      onDragEnd={() => {
                        setDragId(null);
                        setOverCol(null);
                      }}
                      className={cn(
                        "group cursor-grab rounded-xl border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing",
                        dragId === task.id && "opacity-50",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => onView(task)}
                        className="block text-left text-sm font-semibold text-foreground"
                      >
                        {task.title}
                      </button>

                      <p
                        className={cn(
                          "mt-1.5 text-xs",
                          urgencyClass[getDueUrgency(task)],
                        )}
                      >
                        {formatDueShort(task.dueDate)}
                      </p>

                      <div className="mt-3 flex items-center justify-between">
                        {showOwner ? (
                          <OwnerChip name={task.owner.userName} />
                        ) : (
                          <span />
                        )}

                        <div className="flex items-center gap-0.5">
                          {/* prev / next status as a drag fallback */}
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveBy(task, -1)}
                            title="Move left"
                            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-30"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === STATUS_ORDER.length - 1}
                            onClick={() => moveBy(task, 1)}
                            title="Move right"
                            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-30"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                          <span className="mx-0.5 h-4 w-px bg-border" />
                          <button
                            type="button"
                            onClick={() => onEdit(task)}
                            title="Edit"
                            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(task)}
                            title="Delete"
                            className="rounded-md p-1 text-muted-foreground hover:bg-status-overdue-bg hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskBoard;
