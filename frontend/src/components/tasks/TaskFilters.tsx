"use client";

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
  status: TaskStatus | undefined;
  onStatusChange: (status: TaskStatus | undefined) => void;
  //owner filtering is only rendered for admins
  showOwnerFilter: boolean;
  owners: UserListItem[];
  ownerId: string | undefined;
  onOwnerChange: (ownerId: string | undefined) => void;
}

const TaskFilters = ({
  status,
  onStatusChange,
  showOwnerFilter,
  owners,
  ownerId,
  onOwnerChange,
}: TaskFiltersProps) => (
  <div className="flex flex-wrap items-center gap-2">
    <Select
      value={status ?? ALL}
      onValueChange={(value) =>
        onStatusChange(value === ALL ? undefined : (value as TaskStatus))
      }
    >
      <SelectTrigger className="w-[160px]">
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
        <SelectTrigger className="w-[180px]">
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
