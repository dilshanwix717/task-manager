import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  updateTask,
  type CreateTaskPayload,
  type TaskListParams,
  type UpdateTaskPayload,
} from "@/api/tasks";
import { getUsers } from "@/api/users";
import { getApiErrorMessage } from "@/api/axios";

export const useTasks = (params: TaskListParams) =>
  useQuery({
    queryKey: ["tasks", params],
    queryFn: () => getTasks(params),
    placeholderData: keepPreviousData,
  });

export const useTask = (taskId: string) =>
  useQuery({
    queryKey: ["task", taskId],
    queryFn: () => getTaskById(taskId),
    enabled: Boolean(taskId),
    retry: false,
  });

export const useUsers = (enabled: boolean) =>
  useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    enabled,
  });

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => createTask(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task created");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      payload,
    }: {
      taskId: string;
      payload: UpdateTaskPayload;
    }) => updateTask(taskId, payload),
    onSuccess: (task) => {
      queryClient.setQueryData(["task", task.id], task);
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task updated");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => deleteTask(taskId),
    onSuccess: (_, taskId) => {
      queryClient.removeQueries({ queryKey: ["task", taskId] });
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task deleted");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
};
