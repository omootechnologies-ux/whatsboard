import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "default" | "secondary" | "ghost" | "outline";
}

export function Button({ className, variant = "default", asChild, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition",
        variant === "default" && "bg-green-500 text-white hover:bg-green-600",
        variant === "secondary" && "bg-slate-100 text-slate-900 hover:bg-slate-200",
        variant === "ghost" && "text-slate-700 hover:bg-slate-100",
        variant === "outline" && "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50",
        className
      )}
      {...props}
    />
  );
}
