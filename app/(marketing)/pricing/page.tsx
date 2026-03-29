import { Card } from "@/components/ui/card";

export default function PricingPage() {
  return (
    <main className="container-pad py-20">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-semibold">Simple pricing</h1>
        <p className="mt-3 text-slate-600">Start with one simple plan built for sellers who want control, not complexity.</p>
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold">Starter</h2>
          <p className="mt-2 text-slate-600">Track orders, payments, dispatch, and follow-ups.</p>
          <p className="mt-6 text-3xl font-semibold">TZS 25,000<span className="text-sm text-slate-500">/month</span></p>
        </Card>
      </div>
    </main>
  );
}
