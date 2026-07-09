"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "@/lib/utils";

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
  className,
  align = "start",
  sideOffset = 4,
  // when true, render inline instead of in a portal — needed inside a Dialog,
  // whose focus trap otherwise swallows clicks/scroll on portalled content
  inline = false,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content> & {
  inline?: boolean;
}) {
  const content = (
    <PopoverPrimitive.Content
      data-slot="popover-content"
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-auto rounded-lg border bg-popover p-3 text-popover-foreground shadow-md outline-none",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        className,
      )}
      {...props}
    />
  );

  if (inline) return content;
  return <PopoverPrimitive.Portal>{content}</PopoverPrimitive.Portal>;
}

export { Popover, PopoverTrigger, PopoverContent };
