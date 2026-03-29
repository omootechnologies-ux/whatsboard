import { cn } from "@/lib/utils";

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn("w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-3", props.className)} />;
}
