"use client";

import Link from "next/link";
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

export default function CatalogProductForm({
  canManageRecords = true,
}: {
  canManageRecords?: boolean;
}) {
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
    <form action={formAction} className="form-surface grid gap-4">
      {!canManageRecords ? (
        <div className="form-note form-note-warning">
          Upgrade to Growth or above to add catalog products and manage stock.
          <Link href="/pricing" className="ml-2 font-semibold underline">
            Upgrade now
          </Link>
        </div>
      ) : null}

      <fieldset disabled={!canManageRecords} className="contents disabled:opacity-70">
      <div>
        <p className="text-sm font-semibold text-foreground">Add product</p>
        <p className="mt-1 text-xs text-muted-foreground">Upload one product image smaller than 5MB or paste a direct image URL.</p>
      </div>

      <div className="form-grid">
        <label className="form-field">
          <span className="form-label">Product name</span>
          <input name="name" className="form-input" />
        </label>
        <label className="form-field">
          <span className="form-label">Upload image</span>
          <input type="file" accept="image/*" onChange={handleFileChange} className="form-input h-auto py-3 text-sm" />
        </label>
        <label className="form-field md:col-span-2">
          <span className="form-label">Or paste image URL</span>
          <input
            name="imageUrl"
            value={imageUrl.startsWith("data:") ? "" : imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            className="form-input"
          />
        </label>
        <input type="hidden" name="uploadedImageUrl" value={imageUrl.startsWith("data:") ? imageUrl : ""} />
        <label className="form-field">
          <span className="form-label">Price</span>
          <input name="price" type="number" min="0" className="form-input" />
        </label>
        <label className="form-field">
          <span className="form-label">Stock count</span>
          <input name="stockCount" type="number" min="0" className="form-input" />
        </label>
      </div>

      <label className="form-field">
        <span className="form-label">Description</span>
        <textarea name="description" className="form-textarea min-h-[110px]" />
      </label>

      {fileError ? <div className="form-note form-note-error">{fileError}</div> : null}
      {state.error ? <div className="form-note form-note-error">{state.error}</div> : null}
      {state.success ? <div className="form-note form-note-success">Product added to catalog.</div> : null}

      <button
        type="submit"
        disabled={isPending || Boolean(fileError)}
        className="form-submit"
      >
        {isPending ? "Saving..." : "Add product"}
      </button>
      </fieldset>
    </form>
  );
}
