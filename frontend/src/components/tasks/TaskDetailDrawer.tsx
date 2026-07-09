"use client";

import { Pencil, Trash2 } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import StatusBadge from "./StatusBadge";
import OwnerChip from "./OwnerChip";
import { formatDate, cn } from "@/lib/utils";
import { getDueUrgency } from "@/lib/tasks";
import type { Task } from "@/types/task";

interface TaskDetailDrawerProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const urgencyClass: Record<string, string> = {
  overdue: "text-status-overdue-fg font-semibold",
  soon: "text-status-progress-fg font-semibold",
  normal: "text-foreground",
};

const TaskDetailDrawer = ({
  task,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: TaskDetailDrawerProps) => (
  <Drawer open={open} onOpenChange={onOpenChange}>
    <DrawerContent>
      {task && (
        <div className="flex h-full flex-col">
          <div className="pr-8">
            <StatusBadge status={task.status} />
            <DrawerTitle className="mt-3">{task.title}</DrawerTitle>
          </div>

          <div className="mt-6 flex-1 space-y-6 overflow-y-auto scrollbar-thin">
            <section>
              <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Description
              </h3>
              <p className="whitespace-pre-wrap text-sm text-foreground">
                {task.description || "No description provided."}
              </p>
            </section>

            <dl className="space-y-4 rounded-2xl border border-border bg-card p-4">
              <InfoRow label="Due date">
                <span className={cn("text-sm", urgencyClass[getDueUrgency(task)])}>
                  {formatDate(task.dueDate)}
                </span>
              </InfoRow>
              <InfoRow label="Owner">
                <OwnerChip name={task.owner.userName} />
              </InfoRow>
              <InfoRow label="Created">
                <span className="text-sm text-foreground">
                  {formatDate(task.createdAt)}
                </span>
              </InfoRow>
              <InfoRow label="Last updated">
                <span className="text-sm text-foreground">
                  {formatDate(task.updatedAt)}
                </span>
              </InfoRow>
            </dl>
          </div>

          <div className="mt-4 flex gap-2 border-t border-border pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onEdit(task)}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => onDelete(task)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      )}
    </DrawerContent>
  </Drawer>
);

const InfoRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-center justify-between gap-4">
    <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
    <dd>{children}</dd>
  </div>
);

export default TaskDetailDrawer;
