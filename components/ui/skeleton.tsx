import * as React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean;
}

export function Skeleton({ className, shimmer = true, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "rounded-md",
        shimmer ? "skeleton-shimmer" : "animate-pulse bg-slate-200/80",
        className
      )}
      {...props}
    />
  );
}

export default Skeleton;
