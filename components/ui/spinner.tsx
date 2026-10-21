import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: "emerald" | "white" | "slate" | "current";
  label?: string;
}

const sizeClasses = {
  xs: "size-3",
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
  xl: "size-8",
};

const colorClasses = {
  emerald: "text-[#059669]",
  white: "text-white",
  slate: "text-slate-400",
  current: "text-current",
};

export function Spinner({
  size = "md",
  color = "emerald",
  label = "Loading...",
  className,
  ...props
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn("inline-flex items-center justify-center shrink-0", className)}
      {...props}
    >
      <Loader2
        className={cn(
          "animate-spin",
          sizeClasses[size],
          colorClasses[color]
        )}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export default Spinner;
