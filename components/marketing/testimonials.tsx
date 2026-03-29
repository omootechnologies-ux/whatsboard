import { Card } from "@/components/ui/card";

const testimonials = [
  {
    name: "Amina Fashion House",
    role: "Instagram seller",
    quote: "We were getting customers, but losing control after the chat started. Now unpaid orders and follow-ups are visible immediately."
  },
  {
    name: "Glow Beauty Store",
    role: "WhatsApp business",
    quote: "Before this, ‘nimetuma’ messages were confusing. Now payments, packing, and dispatch are all in one place."
  },
  {
    name: "Mbezi Gadgets",
    role: "TikTok seller",
    quote: "The best part is that it works with how we already sell. It organizes the chaos instead of trying to replace WhatsApp."
  }
];

export function Testimonials() {
  return (
    <section id="testimonials" className="container-pad py-20">
      <div className="mb-10 max-w-2xl">
        <p className="text-sm font-medium text-emerald-300">Loved by fast-moving sellers</p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          It feels like clarity, not just software.
        </h2>
        <p className="mt-4 text-slate-300">
          Built for real East African selling behavior — not generic CRM dashboards with no understanding of chat commerce.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {testimonials.map((item) => (
          <Card key={item.name} className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400/10 font-semibold text-emerald-300">
                {item.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-white">{item.name}</p>
                <p className="text-sm text-slate-400">{item.role}</p>
              </div>
            </div>
            <p className="leading-7 text-slate-300">“{item.quote}”</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
