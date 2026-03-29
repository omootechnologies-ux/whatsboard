import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span {...props} className={cn("inline-flex rounded-full bg-white/10 px-2 py-1 text-xs text-slate-200", className)} />;
}
