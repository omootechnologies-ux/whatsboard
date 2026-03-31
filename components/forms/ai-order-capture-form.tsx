"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { ImageUp, Loader2, Sparkles } from "lucide-react";
import { parseAiOrderChat } from "@/lib/ai-order-capture";
import { saveAiOrderCaptureAction } from "@/app/dashboard/actions";

type ActionState = {
  success: boolean;
  error: string | null;
};

const initialState: ActionState = {
  success: false,
  error: null,
};

type PreviewState = {
  customerName: string;
  phone: string;
  productName: string;
  quantity: string;
  variant: string;
  location: string;
  paymentStatus: "unpaid" | "partial" | "paid" | "cod";
  notes: string;
  amount: string;
  confidence: number;
  missingFields: string[];
  addFollowUp: boolean;
};

export default function AiOrderCaptureForm() {
  const [state, formAction, isPending] = useFormState(saveAiOrderCaptureAction, initialState);
  const [chat, setChat] = useState("");
  const [selectedImageName, setSelectedImageName] = useState("");
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [ocrPending, setOcrPending] = useState(false);
  const [preview, setPreview] = useState<PreviewState | null>(null);

  function applyParsedChat(sourceText: string) {
    const parsed = parseAiOrderChat(sourceText);

    setPreview({
      customerName: parsed.customer_name,
      phone: parsed.phone,
      productName: parsed.product_name,
      quantity: parsed.quantity,
      variant: parsed.variant,
      location: parsed.location,
      paymentStatus: (parsed.payment_status || "unpaid") as PreviewState["paymentStatus"],
      notes: parsed.notes,
      amount: "0",
      confidence: parsed.confidence,
      missingFields: parsed.missing_fields,
      addFollowUp: parsed.payment_status !== "paid" && parsed.payment_status !== "cod",
    });
  }

  function parseChat() {
    applyParsedChat(chat);
  }

  async function parseScreenshot(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedImageName("");
      return;
    }

    setSelectedImageName(file.name);
    setOcrError(null);
    setOcrPending(true);

    try {
      const [{ createWorker }, imageUrl] = await Promise.all([
        import("tesseract.js"),
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
          reader.onerror = () => reject(new Error("Unable to read screenshot."));
          reader.readAsDataURL(file);
        }),
      ]);

      const worker = await createWorker(["eng", "swa"]);

      try {
        const result = await worker.recognize(imageUrl);
        const extractedText = result.data.text.replace(/\s+\n/g, "\n").trim();

        if (!extractedText) {
          throw new Error("No readable text was found in the screenshot.");
        }

        setChat(extractedText);
        applyParsedChat(extractedText);
      } finally {
        await worker.terminate();
      }
    } catch (error) {
      setOcrError(error instanceof Error ? error.message : "Unable to extract text from screenshot.");
    } finally {
      setOcrPending(false);
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">Paste WhatsApp chat</p>
            <p className="mt-1 text-xs text-slate-500">
              Paste chat text or upload a WhatsApp screenshot. OCR text is shown below, then parsed with the same rules-first MVP flow.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Upload screenshot</p>
              <p className="mt-1 text-xs text-slate-500">
                Best for clear WhatsApp screenshots with readable text bubbles.
              </p>
            </div>
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700">
              {ocrPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageUp className="h-4 w-4" />}
              {ocrPending ? "Reading screenshot..." : "Upload screenshot"}
              <input type="file" accept="image/*" onChange={parseScreenshot} className="hidden" />
            </label>
          </div>

          {selectedImageName ? (
            <p className="mt-3 text-xs text-slate-500">Selected: {selectedImageName}</p>
          ) : null}
          {ocrError ? (
            <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {ocrError}
            </div>
          ) : null}
        </div>

        <textarea
          value={chat}
          onChange={(event) => setChat(event.target.value)}
          placeholder="Paste a WhatsApp customer chat here, or upload a screenshot and review the extracted text..."
          className="mt-4 min-h-[220px] w-full rounded-3xl border border-slate-300 px-4 py-4 text-sm text-slate-900 outline-none transition focus:border-emerald-400"
        />

        {chat.trim() ? (
          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Extracted raw text</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{chat}</p>
          </div>
        ) : null}

        <button
          type="button"
          onClick={parseChat}
          disabled={!chat.trim() || ocrPending}
          className="mt-4 inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          Parse Chat
        </button>
      </section>

      {preview ? (
        <form action={formAction} className="space-y-5 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Editable preview</p>
              <p className="mt-1 text-xs text-slate-500">
                Confidence: {Math.round(preview.confidence * 100)}%
              </p>
            </div>
            {preview.confidence < 0.5 ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                Low-confidence parse. Review carefully before saving.
              </div>
            ) : preview.missingFields.length ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                Missing: {preview.missingFields.join(", ")}
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                Parse looks complete enough to review and save.
              </div>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Customer name</span>
              <input
                name="customerName"
                value={preview.customerName}
                onChange={(event) => setPreview((current) => current ? { ...current, customerName: event.target.value } : current)}
                className="h-12 rounded-2xl border border-slate-300 px-4 text-slate-900"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Phone</span>
              <input
                name="phone"
                value={preview.phone}
                onChange={(event) => setPreview((current) => current ? { ...current, phone: event.target.value } : current)}
                className="h-12 rounded-2xl border border-slate-300 px-4 text-slate-900"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Product</span>
              <input
                name="productName"
                value={preview.productName}
                onChange={(event) => setPreview((current) => current ? { ...current, productName: event.target.value } : current)}
                className="h-12 rounded-2xl border border-slate-300 px-4 text-slate-900"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Amount</span>
              <input
                name="amount"
                type="number"
                min="0"
                value={preview.amount}
                onChange={(event) => setPreview((current) => current ? { ...current, amount: event.target.value } : current)}
                className="h-12 rounded-2xl border border-slate-300 px-4 text-slate-900"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Quantity</span>
              <input
                name="quantity"
                value={preview.quantity}
                onChange={(event) => setPreview((current) => current ? { ...current, quantity: event.target.value } : current)}
                className="h-12 rounded-2xl border border-slate-300 px-4 text-slate-900"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Variant</span>
              <input
                name="variant"
                value={preview.variant}
                onChange={(event) => setPreview((current) => current ? { ...current, variant: event.target.value } : current)}
                className="h-12 rounded-2xl border border-slate-300 px-4 text-slate-900"
              />
            </label>

            <label className="grid gap-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-700">Location</span>
              <input
                name="location"
                value={preview.location}
                onChange={(event) => setPreview((current) => current ? { ...current, location: event.target.value } : current)}
                className="h-12 rounded-2xl border border-slate-300 px-4 text-slate-900"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Payment status</span>
              <select
                name="paymentStatus"
                value={preview.paymentStatus}
                onChange={(event) =>
                  setPreview((current) =>
                    current ? { ...current, paymentStatus: event.target.value as PreviewState["paymentStatus"] } : current
                  )
                }
                className="h-12 rounded-2xl border border-slate-300 px-4 text-slate-900"
              >
                <option value="unpaid">Unpaid</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
                <option value="cod">COD</option>
              </select>
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3">
              <input
                type="checkbox"
                name="addFollowUp"
                checked={preview.addFollowUp}
                onChange={(event) => setPreview((current) => current ? { ...current, addFollowUp: event.target.checked } : current)}
                className="h-4 w-4"
              />
              <span className="text-sm font-semibold text-slate-700">Add follow-up after save</span>
            </label>
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">Notes</span>
            <textarea
              name="notes"
              value={preview.notes}
              onChange={(event) => setPreview((current) => current ? { ...current, notes: event.target.value } : current)}
              className="min-h-[160px] rounded-2xl border border-slate-300 px-4 py-3 text-slate-900"
            />
          </label>

          <input type="hidden" name="rawChat" value={chat} />

          {state.error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{state.error}</div> : null}
          {state.success ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Chat saved as a normal order.</div> : null}

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save as Order"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
