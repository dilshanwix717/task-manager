"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TaskStatus, UserListItem } from "@/types/task";

const ALL = "ALL";

interface TaskFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: TaskStatus | undefined;
  onStatusChange: (status: TaskStatus | undefined) => void;
  //owner filtering is only rendered for admins
  showOwnerFilter: boolean;
  owners: UserListItem[];
  ownerId: string | undefined;
  onOwnerChange: (ownerId: string | undefined) => void;
}

const TaskFilters = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  showOwnerFilter,
  owners,
  ownerId,
  onOwnerChange,
}: TaskFiltersProps) => (
  <div className="flex flex-wrap items-center gap-2">
    <div className="relative min-w-50 flex-1">
      <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search tasks..."
        className="pl-10"
        aria-label="Search tasks"
      />
    </div>

    <Select
      value={status ?? ALL}
      onValueChange={(value) =>
        onStatusChange(value === ALL ? undefined : (value as TaskStatus))
      }
    >
      <SelectTrigger className="w-40">
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>All statuses</SelectItem>
        <SelectItem value="TODO">To do</SelectItem>
        <SelectItem value="IN_PROGRESS">In progress</SelectItem>
        <SelectItem value="DONE">Done</SelectItem>
      </SelectContent>
    </Select>

    {showOwnerFilter && (
      <Select
        value={ownerId ?? ALL}
        onValueChange={(value) =>
          onOwnerChange(value === ALL ? undefined : value)
        }
      >
        <SelectTrigger className="w-45">
          <SelectValue placeholder="Owner" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All owners</SelectItem>
          {owners.map((owner) => (
            <SelectItem key={owner.id} value={owner.id}>
              {owner.userName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )}
  </div>
);

export default TaskFilters;
