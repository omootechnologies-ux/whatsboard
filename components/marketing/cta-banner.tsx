import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function CtaBanner() {
  return (
    <section className="container-pad py-20">
      <Card className="relative overflow-hidden rounded-[2rem] border-slate-200 bg-gradient-to-br from-slate-900 to-emerald-900 p-8 text-white shadow-2xl shadow-emerald-100 lg:flex lg:items-center lg:justify-between">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="relative max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs">
            <Sparkles className="h-3.5 w-3.5" />
            WhatsApp chaos deserves better software
          </div>
          <h3 className="text-2xl font-semibold lg:text-3xl">
            You already have customers. Stop losing control after the chat starts.
          </h3>
          <p className="mt-3 text-slate-200">
            Track every order from inquiry to payment to dispatch to delivery — without turning your team into detectives.
          </p>
        </div>
        <div className="relative mt-6 lg:mt-0">
          <Button asChild className="bg-white text-slate-900 hover:bg-slate-100">
            <Link href="/register">Track your WhatsApp orders now</Link>
          </Button>
        </div>
      </Card>
    </section>
  );
}
