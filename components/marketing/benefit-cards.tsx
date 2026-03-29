import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";

const benefits = [
  { text: "Fewer forgotten orders", tone: "green" },
  { text: "Faster payment confirmation", tone: "green" },
  { text: "Clear delivery tracking", tone: "green" },
  { text: "Better repeat customer follow-up", tone: "red" },
  { text: "Less staff confusion", tone: "green" },
  { text: "More visibility into unpaid money", tone: "red" }
];

export function BenefitCards() {
  return (
    <section className="container-pad py-16">
      <div className="mb-10 max-w-2xl">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          What changes when the business stops depending on memory
        </h2>
        <p className="mt-3 text-slate-600">
          More control. Less noise. More cash actually collected.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {benefits.map((benefit) => (
          <Card key={benefit.text} className="flex items-start gap-3 p-5 transition hover:-translate-y-1 hover:shadow-md">
            <div className={`mt-0.5 rounded-xl p-2 ${benefit.tone === "green" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="text-base font-medium text-slate-900">{benefit.text}</div>
          </Card>
        ))}
      </div>
    </section>
  );
}
