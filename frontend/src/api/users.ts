// src/api/users.ts
import api from "./axios";
import type { PaginatedResponse, UserListItem } from "@/types/task";

//admin only endpoint, used to populate the owner filter
export const getUsers = async (): Promise<PaginatedResponse<UserListItem>> => {
  const response = await api.get<PaginatedResponse<UserListItem>>("/users", {
    params: { page: 1, limit: 100 },
  });
  return response.data;
};
