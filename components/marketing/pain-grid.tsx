import { AlertTriangle, Clock3, MessageCircleMore, Truck } from "lucide-react";
import { Card } from "@/components/ui/card";

const items = [
  {
    title: "Chats everywhere",
    copy: "Orders live in WhatsApp, payment proof lives in screenshots, and delivery updates live in someone’s head.",
    icon: MessageCircleMore
  },
  {
    title: "Payment confusion",
    copy: "‘nimetuma’ arrives and suddenly everyone becomes a part-time investigator.",
    icon: AlertTriangle
  },
  {
    title: "Dispatch panic",
    copy: "‘ume-dispatch?’ becomes phone calls, stress, and checking five apps at once.",
    icon: Truck
  },
  {
    title: "Lost follow-ups",
    copy: "‘nitachukua kesho’ quietly becomes a lost sale because no one followed up.",
    icon: Clock3
  }
];

export function PainGrid() {
  return (
    <section id="problem" className="container-pad py-16">
      <div className="mb-10 max-w-2xl">
        <h2 className="text-3xl font-bold tracking-tight text-white">
          This is how profit disappears after the chat starts.
        </h2>
        <p className="mt-3 text-slate-300">
          WHATSBOARD is built around the exact messages sellers deal with every day — not generic SaaS fluff.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="p-6 transition hover:-translate-y-1 hover:bg-white/10">
              <div className="mb-4 inline-flex rounded-2xl bg-emerald-400/10 p-3 text-emerald-300">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{item.copy}</p>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
