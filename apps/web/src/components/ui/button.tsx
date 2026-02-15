import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-[var(--surface)]",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--brand)] text-white shadow-[0_8px_20px_-8px_var(--brand-shadow)] hover:bg-[var(--brand-strong)] focus-visible:ring-[var(--brand)]",
        secondary:
          "bg-[var(--surface-2)] text-[var(--text)] border border-[var(--line)] hover:bg-[var(--surface-3)] focus-visible:ring-[var(--brand)]",
        ghost:
          "text-[var(--text)] hover:bg-[var(--surface-2)] focus-visible:ring-[var(--brand)]"
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 px-5 text-base"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return <button className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
