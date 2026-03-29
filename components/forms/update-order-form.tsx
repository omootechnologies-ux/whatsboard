"use client";

import { useActionState, useEffect } from "react";

type UpdateOrderState = {
  success: boolean;
  error: string | null;
};

const initialState: UpdateOrderState = {
  success: false,
  error: null,
};

async function updateAction(
  prevState: UpdateOrderState,
  formData: FormData
): Promise<UpdateOrderState> {
  try {
    // your update logic here

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update order",
    };
  }
}

export default function UpdateOrderForm() {
  const [state, formAction, isPending] = useActionState(updateAction, initialState);

  useEffect(() => {
    if (state.success) {
      console.log("Order updated successfully");
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {isPending ? "Updating..." : "Update Order"}
      </button>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-green-600">Order updated successfully.</p>}
    </form>
  );
}
