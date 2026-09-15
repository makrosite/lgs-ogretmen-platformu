import * as React from "react";

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({ className = "", orientation = "horizontal", ...props }, ref) => (
    <div
      ref={ref}
      role="separator"
      className={`shrink-0 bg-outline-variant/50 ${orientation === "horizontal" ? "h-px w-full" : "h-full w-px"} ${className}`}
      {...props}
    />
  )
);
Separator.displayName = "Separator";

export { Separator };
