import AiOrderCaptureForm from "@/components/forms/ai-order-capture-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AiOrderCapturePage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-[#08192d] p-6 text-white shadow-[0_24px_100px_rgba(2,8,23,0.28)] sm:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-200/80">AI Order Capture</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Turn WhatsApp chat into an order draft</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">
          Paste a customer chat, extract likely order details with deterministic Swahili + English rules,
          review the preview, then save it through the normal order flow.
        </p>
      </section>

      <AiOrderCaptureForm />
    </div>
  );
}
