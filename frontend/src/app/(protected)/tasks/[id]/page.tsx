"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import StatusBadge from "@/components/tasks/StatusBadge";
import OwnerChip from "@/components/tasks/OwnerChip";
import TaskFormDialog from "@/components/tasks/TaskFormDialog";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog";
import { useDeleteTask, useTask, useUpdateTask } from "@/hooks/useTasks";
import { useTaskEvents } from "@/hooks/useTaskEvents";
import { getApiErrorMessage } from "@/api/axios";
import { formatDate, cn } from "@/lib/utils";
import { getDueUrgency } from "@/lib/tasks";
import type { CreateTaskPayload } from "@/api/tasks";

const urgencyClass: Record<string, string> = {
  overdue: "text-status-overdue-fg font-semibold",
  soon: "text-status-progress-fg font-semibold",
  normal: "text-foreground",
};

export default function TaskDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  //next 16 exposes route params as a promise
  const { id } = use(params);
  const router = useRouter();

  const { data: task, isLoading, isError, error } = useTask(id);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  //keep the details in sync when the task changes elsewhere
  useTaskEvents();

  const handleUpdate = (payload: CreateTaskPayload) => {
    updateTask.mutate(
      { taskId: id, payload },
      { onSuccess: () => setEditing(false) },
    );
  };

  const handleDelete = () => {
    deleteTask.mutate(id, {
      onSuccess: () => router.replace("/tasks"),
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/tasks">
          <ArrowLeft className="h-4 w-4" />
          Back to tasks
        </Link>
      </Button>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-8 w-2/3 rounded-xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      ) : isError || !task ? (
        <div className="rounded-2xl border border-destructive/30 bg-status-overdue-bg p-6 text-center text-sm text-destructive">
          {getApiErrorMessage(error)}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold text-foreground">{task.title}</h1>
            <StatusBadge status={task.status} />
          </div>

          <section className="mt-6">
            <h2 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Description
            </h2>
            <p className="whitespace-pre-wrap text-sm text-foreground">
              {task.description || "No description provided."}
            </p>
          </section>

          <dl className="mt-6 grid grid-cols-1 gap-4 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Due date
              </dt>
              <dd
                className={cn("mt-1 text-sm", urgencyClass[getDueUrgency(task)])}
              >
                {formatDate(task.dueDate)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Owner
              </dt>
              <dd className="mt-1">
                <OwnerChip name={task.owner.userName} />
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Created
              </dt>
              <dd className="mt-1 text-sm text-foreground">
                {formatDate(task.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Last updated
              </dt>
              <dd className="mt-1 text-sm text-foreground">
                {formatDate(task.updatedAt)}
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setDeleting(true)}>
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      )}

      {task && (
        <>
          <TaskFormDialog
            open={editing}
            onOpenChange={setEditing}
            task={task}
            isSubmitting={updateTask.isPending}
            onSubmit={handleUpdate}
          />

          <ConfirmationDialog
            open={deleting}
            onOpenChange={setDeleting}
            title="Delete task"
            description={`This will permanently delete "${task.title}".`}
            isLoading={deleteTask.isPending}
            onConfirm={handleDelete}
          />
        </>
      )}
    </div>
  );
}
