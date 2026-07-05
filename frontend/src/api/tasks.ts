// src/api/tasks.ts
import api from "./axios";
import type { PaginatedResponse, Task, TaskStatus } from "@/types/task";

export interface TaskListParams {
  page: number;
  limit: number;
  status?: TaskStatus;
  ownerId?: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  dueDate: string;
}

export type UpdateTaskPayload = Partial<CreateTaskPayload>;

export interface TaskSummary {
  todo: number;
  inProgress: number;
  done: number;
  total: number;
}

export const getTaskSummary = async (): Promise<TaskSummary> => {
  const response = await api.get<TaskSummary>("/tasks/summary");
  return response.data;
};

export const getTasks = async (
  params: TaskListParams,
): Promise<PaginatedResponse<Task>> => {
  const response = await api.get<PaginatedResponse<Task>>("/tasks", {
    params,
  });
  return response.data;
};

export const getTaskById = async (taskId: string): Promise<Task> => {
  const response = await api.get<Task>(`/tasks/${taskId}`);
  return response.data;
};

export const createTask = async (
  payload: CreateTaskPayload,
): Promise<Task> => {
  const response = await api.post<Task>("/tasks", payload);
  return response.data;
};

export const updateTask = async (
  taskId: string,
  payload: UpdateTaskPayload,
): Promise<Task> => {
  const response = await api.patch<Task>(`/tasks/${taskId}`, payload);
  return response.data;
};

export const deleteTask = async (taskId: string): Promise<void> => {
  await api.delete(`/tasks/${taskId}`);
};
