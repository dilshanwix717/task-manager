"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/Pagination";
import TaskFilters from "@/components/tasks/TaskFilters";
import TaskTable from "@/components/tasks/TaskTable";
import TaskFormDialog from "@/components/tasks/TaskFormDialog";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog";
import {
  useCreateTask,
  useDeleteTask,
  useTasks,
  useUpdateTask,
  useUsers,
} from "@/hooks/useTasks";
import { useTaskEvents } from "@/hooks/useTaskEvents";
import { ROLES, useAuthStore } from "@/store/useAuthStore";
import type { CreateTaskPayload } from "@/api/tasks";
import type { Task, TaskStatus } from "@/types/task";

const PAGE_SIZE = 10;

export default function TasksPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === ROLES.admin;

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<TaskStatus | undefined>(undefined);
  const [ownerId, setOwnerId] = useState<string | undefined>(undefined);

  const [createOpen, setCreateOpen] = useState(false);
  const [taskBeingEdited, setTaskBeingEdited] = useState<Task | null>(null);
  const [taskBeingDeleted, setTaskBeingDeleted] = useState<Task | null>(null);

  const { data, isLoading, isError } = useTasks({
    page,
    limit: PAGE_SIZE,
    status,
    ownerId,
  });
  const { data: usersData } = useUsers(isAdmin);

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  //live task events keep the list fresh without refreshing the page
  useTaskEvents();

  const totalPages = data ? Math.max(1, Math.ceil(data.count / PAGE_SIZE)) : 1;

  const handleStatusChange = (next: TaskStatus | undefined) => {
    setStatus(next);
    setPage(1);
  };

  const handleOwnerChange = (next: string | undefined) => {
    setOwnerId(next);
    setPage(1);
  };

  const handleCreate = (payload: CreateTaskPayload) => {
    createTask.mutate(payload, { onSuccess: () => setCreateOpen(false) });
  };

  const handleUpdate = (payload: CreateTaskPayload) => {
    if (!taskBeingEdited) return;
    updateTask.mutate(
      { taskId: taskBeingEdited.id, payload },
      { onSuccess: () => setTaskBeingEdited(null) },
    );
  };

  const handleDelete = () => {
    if (!taskBeingDeleted) return;
    deleteTask.mutate(taskBeingDeleted.id, {
      onSuccess: () => setTaskBeingDeleted(null),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New task
        </Button>
      </div>

      <TaskFilters
        status={status}
        onStatusChange={handleStatusChange}
        showOwnerFilter={isAdmin}
        owners={usersData?.results ?? []}
        ownerId={ownerId}
        onOwnerChange={handleOwnerChange}
      />

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : isError ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-6 text-center text-sm text-destructive">
          Could not load tasks. Is the API running?
        </div>
      ) : data && data.results.length > 0 ? (
        <>
          <TaskTable
            tasks={data.results}
            showOwner={isAdmin}
            onView={(task) => router.push(`/tasks/${task.id}`)}
            onEdit={(task) => setTaskBeingEdited(task)}
            onDelete={(task) => setTaskBeingDeleted(task)}
          />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            hasNextPage={page < totalPages}
            hasPreviousPage={page > 1}
            onNextPage={() => setPage((p) => p + 1)}
            onPreviousPage={() => setPage((p) => Math.max(1, p - 1))}
          />
        </>
      ) : (
        <div className="rounded-md border border-dashed p-10 text-center text-muted-foreground">
          {status || ownerId
            ? "No tasks match the current filters."
            : "No tasks yet. Create your first one!"}
        </div>
      )}

      <TaskFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        isSubmitting={createTask.isPending}
        onSubmit={handleCreate}
      />

      <TaskFormDialog
        open={Boolean(taskBeingEdited)}
        onOpenChange={(open) => !open && setTaskBeingEdited(null)}
        task={taskBeingEdited}
        isSubmitting={updateTask.isPending}
        onSubmit={handleUpdate}
      />

      <ConfirmationDialog
        open={Boolean(taskBeingDeleted)}
        onOpenChange={(open) => !open && setTaskBeingDeleted(null)}
        title="Delete task"
        description={`This will permanently delete "${taskBeingDeleted?.title}".`}
        isLoading={deleteTask.isPending}
        onConfirm={handleDelete}
      />
    </div>
  );
}
