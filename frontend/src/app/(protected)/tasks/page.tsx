"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/Pagination";
import TaskFilters from "@/components/tasks/TaskFilters";
import TaskSummaryChips from "@/components/tasks/TaskSummaryChips";
import TaskTable from "@/components/tasks/TaskTable";
import TaskBoard from "@/components/tasks/TaskBoard";
import ViewToggle, { type TaskView } from "@/components/tasks/ViewToggle";
import TaskDetailDrawer from "@/components/tasks/TaskDetailDrawer";
import TaskFormDialog from "@/components/tasks/TaskFormDialog";
import ConfirmationDialog from "@/components/dialogs/ConfirmationDialog";
import {
  useCreateTask,
  useDeleteTask,
  useTasks,
  useTaskSummary,
  useUpdateTask,
  useUsers,
} from "@/hooks/useTasks";
import { useTaskEvents } from "@/hooks/useTaskEvents";
import { ROLES, useAuthStore } from "@/store/useAuthStore";
import { countOverdue } from "@/lib/tasks";
import type { CreateTaskPayload } from "@/api/tasks";
import type { Task, TaskStatus } from "@/types/task";

const PAGE_SIZE = 10;

export default function TasksPage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === ROLES.admin;

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<TaskStatus | undefined>(undefined);
  const [ownerId, setOwnerId] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<TaskView>("table");

  const [viewingTask, setViewingTask] = useState<Task | null>(null);
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
  const { data: summary } = useTaskSummary();

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  //live task events keep the list fresh without refreshing the page
  useTaskEvents();

  const allTasks = useMemo(() => data?.results ?? [], [data]);

  //search is applied client-side over the current page of results
  const visibleTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allTasks;
    return allTasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description ?? "").toLowerCase().includes(q),
    );
  }, [allTasks, search]);

  const overdue = useMemo(() => countOverdue(allTasks), [allTasks]);

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
      onSuccess: () => {
        setTaskBeingDeleted(null);
        setViewingTask(null);
      },
    });
  };

  //board drag/drop and arrow buttons both flow through here
  const handleBoardStatusChange = (task: Task, nextStatus: TaskStatus) => {
    updateTask.mutate({ taskId: task.id, payload: { status: nextStatus } });
  };

  //open = not-done tasks; done comes from the summary
  const openCount = summary ? summary.todo + summary.inProgress : 0;
  const doneCount = summary?.done ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Tasks
          </h1>
          <SummaryLine open={openCount} done={doneCount} overdue={overdue} />
        </div>
        <Button size="lg" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New task
        </Button>
      </div>

      {/* members only see the summary on desktop; admins see it everywhere */}
      <div className={isAdmin ? undefined : "hidden lg:block"}>
        <TaskSummaryChips overdue={overdue} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <TaskFilters
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={handleStatusChange}
          showOwnerFilter={isAdmin}
          owners={usersData?.results ?? []}
          ownerId={ownerId}
          onOwnerChange={handleOwnerChange}
        />
        <ViewToggle view={view} onChange={setView} />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
          <Skeleton className="h-14 w-full rounded-2xl" />
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-destructive/30 bg-status-overdue-bg p-6 text-center text-sm text-destructive">
          Could not load tasks. Is the API running?
        </div>
      ) : visibleTasks.length > 0 ? (
        <>
          {view === "table" ? (
            <TaskTable
              tasks={visibleTasks}
              showOwner={isAdmin}
              onView={(task) => setViewingTask(task)}
              onEdit={(task) => setTaskBeingEdited(task)}
              onDelete={(task) => setTaskBeingDeleted(task)}
            />
          ) : (
            <TaskBoard
              tasks={visibleTasks}
              showOwner={isAdmin}
              onView={(task) => setViewingTask(task)}
              onEdit={(task) => setTaskBeingEdited(task)}
              onDelete={(task) => setTaskBeingDeleted(task)}
              onStatusChange={handleBoardStatusChange}
            />
          )}

          {view === "table" && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              hasNextPage={page < totalPages}
              hasPreviousPage={page > 1}
              onNextPage={() => setPage((p) => p + 1)}
              onPreviousPage={() => setPage((p) => Math.max(1, p - 1))}
            />
          )}
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-border-strong bg-surface p-12 text-center text-muted-foreground">
          {search || status || ownerId
            ? "No tasks match the current filters."
            : "No tasks yet. Create your first one!"}
        </div>
      )}

      <TaskDetailDrawer
        task={viewingTask}
        open={Boolean(viewingTask)}
        onOpenChange={(open) => !open && setViewingTask(null)}
        onEdit={(task) => {
          setViewingTask(null);
          setTaskBeingEdited(task);
        }}
        onDelete={(task) => setTaskBeingDeleted(task)}
      />

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

// "N open · M done · K overdue" — open/done come from the summary, overdue is
// computed from the visible tasks.
const SummaryLine = ({
  open,
  done,
  overdue,
}: {
  open: number;
  done: number;
  overdue: number;
}) => (
  <p className="mt-1 text-sm text-muted-foreground">
    {open} open · {done} done
    {overdue > 0 && (
      <>
        {" · "}
        <span className="font-semibold text-status-overdue-fg">
          {overdue} overdue
        </span>
      </>
    )}
  </p>
);
