"use client";

import Link from "next/link";
import { useState } from "react";
import { useFormState } from "react-dom";
import { updateOrderAction } from "@/app/dashboard/actions";
import { ORDER_STAGES } from "@/lib/constants";
import type { OrderStage, PaymentStatus } from "@/lib/types";

type OrderRecord = {
  id: string;
  catalog_product_id?: string | null;
  customer_name?: string | null;
  phone?: string | null;
  product_name?: string | null;
  amount?: number | null;
  delivery_area?: string | null;
  stage?: string | null;
  payment_status?: string | null;
  notes?: string | null;
};

type ActionState = {
  success: boolean;
  error: string | null;
};

type CatalogOption = {
  id: string;
  name: string;
  price: number;
  stockCount: number;
  isActive: boolean;
};

const initialState: ActionState = {
  success: false,
  error: null,
};

export default function UpdateOrderForm({
  order,
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
  order: OrderRecord;
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
  const action = updateOrderAction.bind(null, order.id);
  const [state, formAction, isPending] = useFormState(action, initialState);
  const [catalogProductId, setCatalogProductId] = useState(order.catalog_product_id ?? "");
  const [customProduct, setCustomProduct] = useState(order.product_name ?? "");
  const [customAmount, setCustomAmount] = useState(String(order.amount ?? 0));
  const selectedCatalogProduct = catalogProducts.find((item) => item.id === catalogProductId) ?? null;
  const visibleStages = ORDER_STAGES.filter((stage) => allowedStages.includes(stage.key));

  return (
    <form action={formAction} className="form-surface grid gap-4">
      {monthlyOrderLimit !== null ? (
        <div className="form-note form-note-info">
          Free includes {monthlyOrderLimit} orders per month. You have used {orderCountThisMonth} this month
          {remainingMonthlyOrders !== null ? ` and have ${remainingMonthlyOrders} left.` : "."}
        </div>
      ) : null}

      {!canManageRecords ? (
        <div className="form-note form-note-warning">
          You have reached this month&apos;s Free order limit. Upgrade to Starter or above for unlimited orders.
          <Link href="/pricing" className="ml-2 font-semibold underline">
            Upgrade now
          </Link>
        </div>
      ) : null}

      <fieldset disabled={!canManageRecords} className="contents disabled:opacity-70">
      <div className="form-grid">
        <label className="form-field">
          <span className="form-label">Customer name</span>
          <input name="customerName" defaultValue={order.customer_name ?? ""} className="form-input" />
        </label>

        <label className="form-field">
          <span className="form-label">Phone</span>
          <input name="phone" defaultValue={order.phone ?? ""} className="form-input" />
        </label>

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

        <label className="form-field">
          <span className="form-label">Product</span>
          <input
            name="product"
            value={selectedCatalogProduct ? selectedCatalogProduct.name : customProduct}
            onChange={(event) => setCustomProduct(event.target.value)}
            readOnly={Boolean(selectedCatalogProduct)}
            className="form-input read-only:text-muted-foreground"
          />
        </label>

        <label className="form-field">
          <span className="form-label">Amount</span>
          <input
            name="amount"
            type="number"
            min="0"
            value={selectedCatalogProduct ? String(selectedCatalogProduct.price) : customAmount}
            onChange={(event) => setCustomAmount(event.target.value)}
            readOnly={Boolean(selectedCatalogProduct)}
            className="form-input read-only:text-muted-foreground"
          />
        </label>

        <label className="form-field">
          <span className="form-label">Area</span>
          <input name="area" defaultValue={order.delivery_area ?? ""} className="form-input" />
        </label>

        <label className="form-field">
          <span className="form-label">Stage</span>
          <select
            name="stage"
            defaultValue={allowedStages.includes((order.stage as OrderStage) ?? "new_order") ? order.stage ?? "new_order" : allowedStages[0] ?? "new_order"}
            className="form-select"
          >
            {visibleStages.map((stage) => (
              <option key={stage.key} value={stage.key}>
                {stage.label}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span className="form-label">Payment status</span>
          <select
            name="paymentStatus"
            defaultValue={
              allowedPaymentStatuses.includes((order.payment_status as PaymentStatus) ?? "unpaid")
                ? order.payment_status ?? "unpaid"
                : allowedPaymentStatuses[0] ?? "unpaid"
            }
            className="form-select"
          >
            {allowedPaymentStatuses.map((item) => (
              <option key={item} value={item}>
                {item.toUpperCase() === "COD" ? "COD" : item[0].toUpperCase() + item.slice(1)}
              </option>
            ))}
          </select>
        </label>

        {canUsePaymentTracking ? null : (
          <div className="form-note form-note-muted md:col-span-2">
            Payment tracking starts on Starter. Free orders stay in basic tracking mode.
          </div>
        )}

        <div className="form-note form-note-muted md:col-span-2">
          {selectedCatalogProduct
            ? `${selectedCatalogProduct.stockCount} units left in catalog. Changing this order to a different catalog product will restore stock on the previous one and reduce the new one by 1.`
            : "Leave catalog product empty to keep this order as a custom line item."}
        </div>

        {canUseFollowUps ? (
          <>
            <label className="form-check-row md:col-span-2">
              <input type="checkbox" name="addFollowUp" className="h-4 w-4" />
              <span className="text-sm font-semibold text-foreground">Add or update follow-up</span>
            </label>

            <label className="form-field">
              <span className="form-label">Follow-up date</span>
              <input name="followUpDate" type="datetime-local" className="form-input" />
            </label>

            <label className="form-field">
              <span className="form-label">Follow-up note</span>
              <input name="followUpNote" className="form-input" />
            </label>
          </>
        ) : (
          <div className="form-note form-note-muted md:col-span-2">
            Follow-up reminders start on Starter.
          </div>
        )}
      </div>

      <label className="form-field">
        <span className="form-label">Notes</span>
        <textarea name="notes" defaultValue={order.notes ?? ""} className="form-textarea min-h-[130px]" />
      </label>

      {state.error ? <div className="form-note form-note-error">{state.error}</div> : null}
      {state.success ? <div className="form-note form-note-success">Order updated successfully.</div> : null}

      <button type="submit" disabled={isPending} className="form-submit">
        {isPending ? "Saving..." : "Save changes"}
      </button>
      </fieldset>
    </form>
  );
}
