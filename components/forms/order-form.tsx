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
      className="form-submit w-full"
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
    <form action={formAction} className="form-grid">
      {monthlyOrderLimit !== null ? (
        <div className="form-note form-note-info md:col-span-2">
          Free includes {monthlyOrderLimit} orders per month. You have used {orderCountThisMonth} this month
          {remainingMonthlyOrders !== null ? ` and have ${remainingMonthlyOrders} left.` : "."}
        </div>
      ) : null}

      {!canManageRecords ? (
        <div className="form-note form-note-warning md:col-span-2">
          You have reached this month&apos;s Free order limit. Upgrade to Starter or above for unlimited orders.
          <Link href="/pricing" className="ml-2 font-semibold underline">
            Upgrade now
          </Link>
        </div>
      ) : null}

      <fieldset disabled={!canManageRecords} className="contents disabled:opacity-70">
      <input name="customerName" placeholder="Customer name" className="form-input" />
      <input name="phone" placeholder="Phone number" className="form-input" />
      <input name="area" placeholder="Delivery area" className="form-input" />
      <label className="form-field">
        <span className="form-label">Catalog product</span>
        <select
          name="catalogProductId"
          value={catalogProductId}
          onChange={(event) => setCatalogProductId(event.target.value)}
          className="form-select"
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
      <div className="form-field">
        <span className="form-label">Price</span>
        <input
          name="amount"
          type="number"
          placeholder="Amount"
          readOnly={Boolean(selectedCatalogProduct)}
          value={selectedCatalogProduct ? String(selectedCatalogProduct.price) : customAmount}
          onChange={(event) => setCustomAmount(event.target.value)}
          className="form-input read-only:text-muted-foreground"
        />
      </div>
      <input
        name="product"
        placeholder="Product or service"
        readOnly={Boolean(selectedCatalogProduct)}
        value={selectedCatalogProduct ? selectedCatalogProduct.name : customProduct}
        onChange={(event) => setCustomProduct(event.target.value)}
        className="form-input read-only:text-muted-foreground"
      />

      {selectedCatalogProduct ? (
        <div className="form-note form-note-info">
          {selectedCatalogProduct.stockCount} units left in catalog. Saving this order will reduce stock by 1.
        </div>
      ) : (
        <div className="form-note form-note-muted">
          Choose a catalog product to lock the price and sync stock automatically, or leave it as a custom order.
        </div>
      )}

      <select name="stage" defaultValue={visibleStages[0]?.key ?? "new_order"} className="form-select">
        {visibleStages.map((stage) => (
          <option key={stage.key} value={stage.key}>
            {stage.label}
          </option>
        ))}
      </select>

      <select
        name="paymentStatus"
        defaultValue={allowedPaymentStatuses[0] ?? "unpaid"}
        className="form-select"
      >
        {allowedPaymentStatuses.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      {canUsePaymentTracking ? null : (
        <div className="form-note form-note-muted md:col-span-2">
          Payment tracking starts on Starter. Free orders are saved as unpaid until you upgrade.
        </div>
      )}

      {canUseFollowUps ? (
        <>
          <label className="form-check-row md:col-span-2">
            <input type="checkbox" name="addFollowUp" className="h-4 w-4" />
            <span>Add follow-up</span>
          </label>

          <input
            name="followUpDate"
            type="datetime-local"
            className="form-input"
          />

          <input
            name="followUpNote"
            placeholder="Follow-up note"
            className="form-input"
          />
        </>
      ) : (
        <div className="form-note form-note-muted md:col-span-2">
          Follow-up reminders start on Starter. Free is focused on basic order tracking only.
        </div>
      )}

      <textarea name="notes" placeholder="Notes" className="form-textarea min-h-28 md:col-span-2" />

      {state.error ? <p className="form-note form-note-error md:col-span-2">{state.error}</p> : null}
      {state.success ? <p className="form-note form-note-success md:col-span-2">Order created successfully.</p> : null}

      <div className="md:col-span-2">
        <SubmitButton />
      </div>
      </fieldset>
    </form>
  );
}
