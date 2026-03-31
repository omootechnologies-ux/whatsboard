"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createOrderAction } from "@/app/dashboard/actions";
import { ORDER_STAGES } from "@/lib/constants";
import type { OrderStage, PaymentStatus } from "@/lib/types";

type OrderFormState = {
  error: string | null;
  success: boolean;
};

type CatalogOption = {
  id: string;
  name: string;
  price: number;
  stockCount: number;
  isActive: boolean;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      disabled={pending}
      className="w-full rounded-2xl bg-emerald-400 px-4 py-3 font-medium text-slate-950 disabled:opacity-60"
    >
      {pending ? "Saving..." : "Create order"}
    </button>
  );
}

export function OrderForm({
  catalogProducts = [],
  canManageRecords = true,
  allowedStages = ["new_order", "waiting_payment"],
  allowedPaymentStatuses = ["unpaid"],
  canUseFollowUps = false,
  canUsePaymentTracking = false,
  monthlyOrderLimit = null,
  orderCountThisMonth = 0,
  remainingMonthlyOrders = null,
}: {
  catalogProducts?: CatalogOption[];
  canManageRecords?: boolean;
  allowedStages?: OrderStage[];
  allowedPaymentStatuses?: PaymentStatus[];
  canUseFollowUps?: boolean;
  canUsePaymentTracking?: boolean;
  monthlyOrderLimit?: number | null;
  orderCountThisMonth?: number;
  remainingMonthlyOrders?: number | null;
}) {
  const [state, formAction] = useFormState(createOrderAction, {
    error: null,
    success: false,
  });
  const [catalogProductId, setCatalogProductId] = useState("");
  const [customProduct, setCustomProduct] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const selectedCatalogProduct = catalogProducts.find((item) => item.id === catalogProductId) ?? null;
  const visibleStages = ORDER_STAGES.filter((stage) => allowedStages.includes(stage.key));

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      {monthlyOrderLimit !== null ? (
        <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800 md:col-span-2">
          Free includes {monthlyOrderLimit} orders per month. You have used {orderCountThisMonth} this month
          {remainingMonthlyOrders !== null ? ` and have ${remainingMonthlyOrders} left.` : "."}
        </div>
      ) : null}

      {!canManageRecords ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 md:col-span-2">
          You have reached this month&apos;s Free order limit. Upgrade to Starter or above for unlimited orders.
          <Link href="/pricing" className="ml-2 font-semibold underline">
            Upgrade now
          </Link>
        </div>
      ) : null}

      <fieldset disabled={!canManageRecords} className="contents disabled:opacity-70">
      <input name="customerName" placeholder="Customer name" className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3" />
      <input name="phone" placeholder="Phone number" className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3" />
      <input name="area" placeholder="Delivery area" className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3" />
      <label className="grid gap-2">
        <span className="text-sm text-white/70">Catalog product</span>
        <select
          name="catalogProductId"
          value={catalogProductId}
          onChange={(event) => setCatalogProductId(event.target.value)}
          className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3"
        >
          <option value="">Custom product</option>
          {catalogProducts
            .filter((item) => item.isActive || item.id === catalogProductId)
            .map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} • TZS {item.price.toLocaleString()} • {item.stockCount} left
              </option>
            ))}
        </select>
      </label>
      <div className="grid gap-2">
        <span className="text-sm text-white/70">Price</span>
        <input
          name="amount"
          type="number"
          placeholder="Amount"
          readOnly={Boolean(selectedCatalogProduct)}
          value={selectedCatalogProduct ? String(selectedCatalogProduct.price) : customAmount}
          onChange={(event) => setCustomAmount(event.target.value)}
          className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 read-only:text-white/70"
        />
      </div>
      <input
        name="product"
        placeholder="Product or service"
        readOnly={Boolean(selectedCatalogProduct)}
        value={selectedCatalogProduct ? selectedCatalogProduct.name : customProduct}
        onChange={(event) => setCustomProduct(event.target.value)}
        className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 read-only:text-white/70"
      />

      {selectedCatalogProduct ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
          {selectedCatalogProduct.stockCount} units left in catalog. Saving this order will reduce stock by 1.
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white/55">
          Choose a catalog product to lock the price and sync stock automatically, or leave it as a custom order.
        </div>
      )}

      <select name="stage" defaultValue={visibleStages[0]?.key ?? "new_order"} className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3">
        {visibleStages.map((stage) => (
          <option key={stage.key} value={stage.key}>
            {stage.label}
          </option>
        ))}
      </select>

      <select
        name="paymentStatus"
        defaultValue={allowedPaymentStatuses[0] ?? "unpaid"}
        className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3"
      >
        {allowedPaymentStatuses.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      {canUsePaymentTracking ? null : (
        <div className="rounded-2xl border border-slate-700 bg-slate-950/40 px-4 py-3 text-sm text-white/55 md:col-span-2">
          Payment tracking starts on Starter. Free orders are saved as unpaid until you upgrade.
        </div>
      )}

      {canUseFollowUps ? (
        <>
          <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 md:col-span-2">
            <input type="checkbox" name="addFollowUp" className="h-4 w-4" />
            <span>Add follow-up</span>
          </label>

          <input
            name="followUpDate"
            type="datetime-local"
            className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3"
          />

          <input
            name="followUpNote"
            placeholder="Follow-up note"
            className="rounded-2xl border border-white/10 bg-slate-900 px-4 py-3"
          />
        </>
      ) : (
        <div className="rounded-2xl border border-slate-700 bg-slate-950/40 px-4 py-3 text-sm text-white/55 md:col-span-2">
          Follow-up reminders start on Starter. Free is focused on basic order tracking only.
        </div>
      )}

      <textarea name="notes" placeholder="Notes" className="min-h-28 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 md:col-span-2" />

      {state.error ? <p className="text-sm text-rose-300 md:col-span-2">{state.error}</p> : null}
      {state.success ? <p className="text-sm text-emerald-300 md:col-span-2">Order created successfully.</p> : null}

      <div className="md:col-span-2">
        <SubmitButton />
      </div>
      </fieldset>
    </form>
  );
}
