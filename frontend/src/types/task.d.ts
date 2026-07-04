export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface TaskOwner {
  id: string;
  userName: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: string;
  owner: TaskOwner;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  count: number;
  currentPage: number;
  offset: number;
  results: T[];
}

export interface UserListItem {
  id: string;
  userName: string;
  email: string;
  role: { name: string };
}
