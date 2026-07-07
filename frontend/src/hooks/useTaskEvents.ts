import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { SOCKET_URL } from "@/api/axios";
import { useAuthStore } from "@/store/useAuthStore";
import type { Task } from "@/types/task";

//keeps the query cache in sync with the task events pushed by the backend
export const useTaskEvents = () => {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
    });

    const refreshLists = () => {
      void queryClient.invalidateQueries({ queryKey: ["tasks"] });
    };

    socket.on("task.created", refreshLists);

    socket.on("task.updated", (task: Task) => {
      queryClient.setQueryData(["task", task.id], task);
      refreshLists();
    });

    socket.on("task.deleted", (task: Task) => {
      queryClient.removeQueries({ queryKey: ["task", task.id] });
      refreshLists();
    });

    return () => {
      socket.disconnect();
    };
  }, [token, queryClient]);
};
