import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "h-10 w-full rounded-full border border-border bg-card px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20",
      className,
    )}
    {...props}
  />
));

Input.displayName = "Input";

export { Input };
