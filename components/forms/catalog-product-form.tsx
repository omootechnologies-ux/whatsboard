"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { createCatalogProductAction } from "@/app/dashboard/actions";

type ActionState = {
  success: boolean;
  error: string | null;
};

const initialState: ActionState = {
  success: false,
  error: null,
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export default function CatalogProductForm() {
  const [state, formAction, isPending] = useFormState(createCatalogProductAction, initialState);
  const [imageUrl, setImageUrl] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setImageUrl("");
      setFileError(null);
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setFileError("Image must be smaller than 5MB.");
      setImageUrl("");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(typeof reader.result === "string" ? reader.result : "");
      setFileError(null);
    };
    reader.onerror = () => {
      setFileError("Unable to read image file.");
      setImageUrl("");
    };
    reader.readAsDataURL(file);
  }

  return (
    <form action={formAction} className="grid gap-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-slate-900">Add product</p>
        <p className="mt-1 text-xs text-slate-500">Upload one product image smaller than 5MB or paste a direct image URL.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Product name</span>
          <input name="name" className="h-12 rounded-2xl border border-slate-300 px-4 text-slate-900" />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Upload image</span>
          <input type="file" accept="image/*" onChange={handleFileChange} className="rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-700" />
        </label>
        <label className="grid gap-2 md:col-span-2">
          <span className="text-sm font-semibold text-slate-700">Or paste image URL</span>
          <input
            name="imageUrl"
            value={imageUrl.startsWith("data:") ? "" : imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            className="h-12 rounded-2xl border border-slate-300 px-4 text-slate-900"
          />
        </label>
        <input type="hidden" name="uploadedImageUrl" value={imageUrl.startsWith("data:") ? imageUrl : ""} />
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Price</span>
          <input name="price" type="number" min="0" className="h-12 rounded-2xl border border-slate-300 px-4 text-slate-900" />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Stock count</span>
          <input name="stockCount" type="number" min="0" className="h-12 rounded-2xl border border-slate-300 px-4 text-slate-900" />
        </label>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-semibold text-slate-700">Description</span>
        <textarea name="description" className="min-h-[110px] rounded-2xl border border-slate-300 px-4 py-3 text-slate-900" />
      </label>

      {fileError ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{fileError}</div> : null}
      {state.error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{state.error}</div> : null}
      {state.success ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Product added to catalog.</div> : null}

      <button
        type="submit"
        disabled={isPending || Boolean(fileError)}
        className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Add product"}
      </button>
    </form>
  );
}
