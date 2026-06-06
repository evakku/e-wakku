import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        // E-Wakku editorial form field: tonal bg · 4px radius · 48px height · Emerald focus
        "h-12 w-full min-w-0 rounded border border-transparent bg-input px-4 py-2.5 text-base transition-all outline-none",
        "placeholder:text-muted-foreground/70",
        "focus-visible:border-ring focus-visible:bg-card focus-visible:ring-3 focus-visible:ring-ring/20",
        "file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        "dark:bg-input/30 dark:focus-visible:bg-card dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
