"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import StatusBadge from "@/components/tasks/StatusBadge";
import TaskFormDialog from "@/components/tasks/TaskFormDialog";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog";
import { useDeleteTask, useTask, useUpdateTask } from "@/hooks/useTasks";
import { useTaskEvents } from "@/hooks/useTaskEvents";
import { getApiErrorMessage } from "@/api/axios";
import { formatDate } from "@/lib/utils";
import type { CreateTaskPayload } from "@/api/tasks";

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
    <div className="mx-auto max-w-2xl space-y-4">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/tasks">
          <ArrowLeft className="h-4 w-4" />
          Back to tasks
        </Link>
      </Button>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : isError || !task ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
          {getApiErrorMessage(error)}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-xl">{task.title}</CardTitle>
                <CardDescription>
                  Owned by {task.owner.userName}
                </CardDescription>
              </div>
              <StatusBadge status={task.status} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h2 className="mb-1 text-sm font-semibold text-muted-foreground">
                Description
              </h2>
              <p className="whitespace-pre-wrap text-sm">
                {task.description || "No description provided."}
              </p>
            </div>

            <Separator />

            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-muted-foreground">
                  Due date
                </dt>
                <dd>{formatDate(task.dueDate)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-muted-foreground">Owner</dt>
                <dd>{task.owner.userName}</dd>
              </div>
              <div>
                <dt className="font-semibold text-muted-foreground">
                  Created
                </dt>
                <dd>{formatDate(task.createdAt)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-muted-foreground">
                  Last updated
                </dt>
                <dd>{formatDate(task.updatedAt)}</dd>
              </div>
            </dl>

            <Separator />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditing(true)}>
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button variant="destructive" onClick={() => setDeleting(true)}>
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
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
