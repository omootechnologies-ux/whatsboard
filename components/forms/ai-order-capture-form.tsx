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
      <section className="form-surface">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">Paste WhatsApp chat</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Paste chat text or upload a WhatsApp screenshot. OCR text is shown below, then parsed with the same rules-first MVP flow.
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-3xl border border-border bg-secondary/50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Upload screenshot</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Best for clear WhatsApp screenshots with readable text bubbles.
              </p>
            </div>
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground transition hover:border-primary/30 hover:text-primary">
              {ocrPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageUp className="h-4 w-4" />}
              {ocrPending ? "Reading screenshot..." : "Upload screenshot"}
              <input type="file" accept="image/*" onChange={parseScreenshot} className="hidden" />
            </label>
          </div>

          {selectedImageName ? (
            <p className="mt-3 text-xs text-muted-foreground">Selected: {selectedImageName}</p>
          ) : null}
          {ocrError ? (
            <div className="form-note form-note-error mt-3">
              {ocrError}
            </div>
          ) : null}
        </div>

        <textarea
          value={chat}
          onChange={(event) => setChat(event.target.value)}
          placeholder="Paste a WhatsApp customer chat here, or upload a screenshot and review the extracted text..."
          className="form-textarea mt-4 min-h-[220px] rounded-3xl text-sm"
        />

        {chat.trim() ? (
          <div className="mt-4 rounded-2xl border border-border bg-secondary/50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Extracted raw text</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/80">{chat}</p>
          </div>
        ) : null}

        <button
          type="button"
          onClick={parseChat}
          disabled={!chat.trim() || ocrPending}
          className="form-submit mt-4"
        >
          Parse Chat
        </button>
      </section>

      {preview ? (
        <form action={formAction} className="form-surface space-y-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-foreground">Editable preview</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Confidence: {Math.round(preview.confidence * 100)}%
              </p>
            </div>
            {preview.confidence < 0.5 ? (
              <div className="form-note form-note-error">
                Low-confidence parse. Review carefully before saving.
              </div>
            ) : preview.missingFields.length ? (
              <div className="form-note form-note-warning">
                Missing: {preview.missingFields.join(", ")}
              </div>
            ) : (
              <div className="form-note form-note-success">
                Parse looks complete enough to review and save.
              </div>
            )}
          </div>

          <div className="form-grid">
            <label className="form-field">
              <span className="form-label">Customer name</span>
              <input
                name="customerName"
                value={preview.customerName}
                onChange={(event) => setPreview((current) => current ? { ...current, customerName: event.target.value } : current)}
                className="form-input"
              />
            </label>

            <label className="form-field">
              <span className="form-label">Phone</span>
              <input
                name="phone"
                value={preview.phone}
                onChange={(event) => setPreview((current) => current ? { ...current, phone: event.target.value } : current)}
                className="form-input"
              />
            </label>

            <label className="form-field">
              <span className="form-label">Product</span>
              <input
                name="productName"
                value={preview.productName}
                onChange={(event) => setPreview((current) => current ? { ...current, productName: event.target.value } : current)}
                className="form-input"
              />
            </label>

            <label className="form-field">
              <span className="form-label">Amount</span>
              <input
                name="amount"
                type="number"
                min="0"
                value={preview.amount}
                onChange={(event) => setPreview((current) => current ? { ...current, amount: event.target.value } : current)}
                className="form-input"
              />
            </label>

            <label className="form-field">
              <span className="form-label">Quantity</span>
              <input
                name="quantity"
                value={preview.quantity}
                onChange={(event) => setPreview((current) => current ? { ...current, quantity: event.target.value } : current)}
                className="form-input"
              />
            </label>

            <label className="form-field">
              <span className="form-label">Variant</span>
              <input
                name="variant"
                value={preview.variant}
                onChange={(event) => setPreview((current) => current ? { ...current, variant: event.target.value } : current)}
                className="form-input"
              />
            </label>

            <label className="form-field md:col-span-2">
              <span className="form-label">Location</span>
              <input
                name="location"
                value={preview.location}
                onChange={(event) => setPreview((current) => current ? { ...current, location: event.target.value } : current)}
                className="form-input"
              />
            </label>

            <label className="form-field">
              <span className="form-label">Payment status</span>
              <select
                name="paymentStatus"
                value={preview.paymentStatus}
                onChange={(event) =>
                  setPreview((current) =>
                    current ? { ...current, paymentStatus: event.target.value as PreviewState["paymentStatus"] } : current
                  )
                }
                className="form-select"
              >
                <option value="unpaid">Unpaid</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
                <option value="cod">COD</option>
              </select>
            </label>

            <label className="form-check-row">
              <input
                type="checkbox"
                name="addFollowUp"
                checked={preview.addFollowUp}
                onChange={(event) => setPreview((current) => current ? { ...current, addFollowUp: event.target.checked } : current)}
                className="h-4 w-4"
              />
              <span className="text-sm font-semibold text-foreground">Add follow-up after save</span>
            </label>
          </div>

          <label className="form-field">
            <span className="form-label">Notes</span>
            <textarea
              name="notes"
              value={preview.notes}
              onChange={(event) => setPreview((current) => current ? { ...current, notes: event.target.value } : current)}
              className="form-textarea min-h-[160px]"
            />
          </label>

          <input type="hidden" name="rawChat" value={chat} />

          {state.error ? <div className="form-note form-note-error">{state.error}</div> : null}
          {state.success ? <div className="form-note form-note-success">Chat saved as a normal order.</div> : null}

          <button
            type="submit"
            disabled={isPending}
            className="form-submit"
          >
            {isPending ? "Saving..." : "Save as Order"}
          </button>
        </form>
      ) : null}
    </div>
  );
}
