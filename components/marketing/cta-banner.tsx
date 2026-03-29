import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function CtaBanner() {
  return (
    <section className="container-pad py-20">
      <Card className="relative overflow-hidden rounded-[2rem] border-white/10 bg-gradient-to-br from-emerald-600/20 via-slate-900 to-slate-950 p-8 shadow-2xl shadow-emerald-950/30 lg:flex lg:items-center lg:justify-between">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="relative max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-emerald-200">
            <Sparkles className="h-3.5 w-3.5" />
            WhatsApp chaos deserves better software
          </div>
          <h3 className="text-2xl font-semibold text-white lg:text-3xl">
            You already have customers. Stop losing control after the chat starts.
          </h3>
          <p className="mt-3 text-slate-300">
            Track every order from inquiry to payment to dispatch to delivery — without turning your team into detectives.
          </p>
        </div>

        <div className="relative mt-6 lg:mt-0">
          <Button asChild className="glow-soft">
            <Link href="/register">Track your WhatsApp orders now</Link>
          </Button>
        </div>
      </Card>
    </section>
  );
}
