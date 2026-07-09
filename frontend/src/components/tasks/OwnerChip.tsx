import { cn } from "@/lib/utils";

// small avatar + name chip used in the table and drawer to show a task owner
const OwnerChip = ({ name, className }: { name: string; className?: string }) => (
  <span className={cn("inline-flex items-center gap-2", className)}>
    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-tint text-[11px] font-bold text-primary-hover">
      {name.charAt(0).toUpperCase()}
    </span>
    <span className="text-sm text-foreground">{name}</span>
  </span>
);

export default OwnerChip;
