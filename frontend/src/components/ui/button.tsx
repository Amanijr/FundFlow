"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { Spinner } from "@/components/ui/spinner";
import { materialGradientClasses } from "@/lib/utils/material-styles";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-control)] text-body font-medium shadow-none transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: cn(materialGradientClasses, "active:brightness-95"),
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:brightness-95",
        outline:
          "border border-border bg-surface text-foreground hover:bg-muted hover:text-foreground active:bg-muted",
        secondary:
          "border border-border bg-secondary text-secondary-foreground hover:bg-muted hover:text-foreground active:bg-muted",
        ghost: "text-foreground hover:bg-muted hover:text-foreground active:bg-muted",
        link: "text-link underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 min-h-9 px-3",
        sm: "h-8 min-h-8 rounded-[var(--radius-control)] px-2.5 text-label",
        lg: "h-10 min-h-10 rounded-[var(--radius-control)] px-4",
        icon: "h-9 w-9 min-h-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** Shows spinner, disables the control, keeps label for stable width. */
  loading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = Boolean(disabled || loading);
  const Comp = asChild && !loading ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={Comp === "button" ? isDisabled : undefined}
      aria-busy={loading || undefined}
      aria-disabled={asChild && isDisabled ? true : undefined}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size="sm" className="text-current" label="Loading" />
          <span className="inline-flex items-center gap-2">{children}</span>
        </>
      ) : (
        children
      )}
    </Comp>
  );
}

export { buttonVariants };
