import { AlertTriangle, Clock3, MessageCircleMore, Truck } from "lucide-react";
import { Card } from "@/components/ui/card";

const items = [
  {
    title: "Chats everywhere",
    copy: "The order is in WhatsApp, the payment proof is in screenshots, and the delivery update is in someone’s head.",
    icon: MessageCircleMore
  },
  {
    title: "Payment confusion",
    copy: "‘nimetuma’ arrives and suddenly everyone becomes a part-time detective.",
    icon: AlertTriangle
  },
  {
    title: "Dispatch panic",
    copy: "‘ume-dispatch?’ turns into phone calls, shouting, and 8 tabs open for no reason.",
    icon: Truck
  },
  {
    title: "Lost follow-ups",
    copy: "‘nitachukua kesho’ quietly becomes ‘we lost that sale.’",
    icon: Clock3
  }
];

export function PainGrid() {
  return (
    <section className="container-pad py-16">
      <div className="mb-10 max-w-2xl">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          This is how profit disappears after the chat starts.
        </h2>
        <p className="mt-3 text-slate-600">
          WHATSBOARD understands the daily comedy and tragedy of selling through WhatsApp.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.title} className="group p-6 transition hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-4 inline-flex rounded-2xl bg-slate-100 p-3 text-emerald-600 transition group-hover:bg-emerald-50">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{item.copy}</p>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
