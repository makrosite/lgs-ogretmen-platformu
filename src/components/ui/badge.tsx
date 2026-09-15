import * as React from "react";

type Variant = "default" | "secondary" | "outline" | "success" | "destructive";

const variantClasses: Record<Variant, string> = {
  default: "bg-secondary/10 text-secondary border-secondary/20",
  secondary: "bg-surface-container text-on-surface-variant border-outline-variant/60",
  outline: "bg-transparent text-on-surface border-outline-variant",
  success: "bg-on-tertiary-container/10 text-on-tertiary-container border-on-tertiary-container/20",
  destructive: "bg-error/10 text-error border-error/20",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
}

function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}

export { Badge };
