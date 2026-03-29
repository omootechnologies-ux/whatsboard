import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";

const benefits = [
  "Fewer forgotten orders",
  "Faster payment confirmation",
  "Clear delivery tracking",
  "Better repeat customer follow-up",
  "Less staff confusion",
  "More visibility into unpaid money"
];

export function BenefitCards() {
  return (
    <section className="container-pad py-16">
      <div className="mb-10 max-w-2xl">
        <h2 className="text-3xl font-bold tracking-tight text-white">
          What changes when the business stops depending on memory
        </h2>
        <p className="mt-3 text-slate-300">
          More control. Less noise. More cash actually collected.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {benefits.map((benefit) => (
          <Card key={benefit} className="flex items-start gap-3 p-5 transition hover:-translate-y-1 hover:bg-white/10">
            <div className="mt-0.5 rounded-xl bg-emerald-400/10 p-2 text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="text-base font-medium text-white">{benefit}</div>
          </Card>
        ))}
      </div>
    </section>
  );
}
