import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";

export function StatCard({
  label,
  value,
  hint
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card className="relative overflow-hidden p-5 shadow-sm transition hover:shadow-md">
      <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-emerald-50 blur-2xl" />
      <div className="relative">
        <div className="mb-4 inline-flex rounded-xl bg-slate-100 p-2 text-emerald-600">
          <ArrowUpRight className="h-4 w-4" />
        </div>
        <p className="text-sm text-slate-500">{label}</p>
        <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</h3>
        {hint ? <p className="mt-2 text-sm text-slate-600">{hint}</p> : null}
      </div>
    </Card>
  );
}
