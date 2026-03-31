"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import { updateOrderAction } from "@/app/dashboard/actions";

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
}: {
  order: OrderRecord;
  catalogProducts?: CatalogOption[];
}) {
  const action = updateOrderAction.bind(null, order.id);
  const [state, formAction, isPending] = useFormState(action, initialState);
  const [catalogProductId, setCatalogProductId] = useState(order.catalog_product_id ?? "");
  const [customProduct, setCustomProduct] = useState(order.product_name ?? "");
  const [customAmount, setCustomAmount] = useState(String(order.amount ?? 0));
  const selectedCatalogProduct = catalogProducts.find((item) => item.id === catalogProductId) ?? null;

  return (
    <form action={formAction} className="grid gap-4 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Customer name</span>
          <input name="customerName" defaultValue={order.customer_name ?? ""} className="h-12 w-full rounded-2xl border border-slate-300 px-4 text-slate-900" />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Phone</span>
          <input name="phone" defaultValue={order.phone ?? ""} className="h-12 w-full rounded-2xl border border-slate-300 px-4 text-slate-900" />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Catalog product</span>
          <select
            name="catalogProductId"
            value={catalogProductId}
            onChange={(event) => setCatalogProductId(event.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-300 px-4 text-slate-900"
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

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Product</span>
          <input
            name="product"
            value={selectedCatalogProduct ? selectedCatalogProduct.name : customProduct}
            onChange={(event) => setCustomProduct(event.target.value)}
            readOnly={Boolean(selectedCatalogProduct)}
            className="h-12 w-full rounded-2xl border border-slate-300 px-4 text-slate-900 read-only:text-slate-500"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Amount</span>
          <input
            name="amount"
            type="number"
            min="0"
            value={selectedCatalogProduct ? String(selectedCatalogProduct.price) : customAmount}
            onChange={(event) => setCustomAmount(event.target.value)}
            readOnly={Boolean(selectedCatalogProduct)}
            className="h-12 w-full rounded-2xl border border-slate-300 px-4 text-slate-900 read-only:text-slate-500"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Area</span>
          <input name="area" defaultValue={order.delivery_area ?? ""} className="h-12 w-full rounded-2xl border border-slate-300 px-4 text-slate-900" />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Stage</span>
          <select name="stage" defaultValue={order.stage ?? "new_order"} className="h-12 w-full rounded-2xl border border-slate-300 px-4 text-slate-900">
            <option value="new_order">New Order</option>
            <option value="waiting_payment">Waiting Payment</option>
            <option value="paid">Paid</option>
            <option value="packing">Packing</option>
            <option value="dispatched">Dispatched</option>
            <option value="delivered">Delivered</option>
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Payment status</span>
          <select name="paymentStatus" defaultValue={order.payment_status ?? "unpaid"} className="h-12 w-full rounded-2xl border border-slate-300 px-4 text-slate-900">
            <option value="unpaid">Unpaid</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
            <option value="cod">COD</option>
          </select>
        </label>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 md:col-span-2">
          {selectedCatalogProduct
            ? `${selectedCatalogProduct.stockCount} units left in catalog. Changing this order to a different catalog product will restore stock on the previous one and reduce the new one by 1.`
            : "Leave catalog product empty to keep this order as a custom line item."}
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-3 md:col-span-2">
          <input type="checkbox" name="addFollowUp" className="h-4 w-4" />
          <span className="text-sm font-semibold text-slate-700">Add or update follow-up</span>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Follow-up date</span>
          <input name="followUpDate" type="datetime-local" className="h-12 w-full rounded-2xl border border-slate-300 px-4 text-slate-900" />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">Follow-up note</span>
          <input name="followUpNote" className="h-12 w-full rounded-2xl border border-slate-300 px-4 text-slate-900" />
        </label>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-semibold text-slate-700">Notes</span>
        <textarea name="notes" defaultValue={order.notes ?? ""} className="min-h-[130px] w-full rounded-2xl border border-slate-300 px-4 py-3 text-slate-900" />
      </label>

      {state.error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{state.error}</div> : null}
      {state.success ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Order updated successfully.</div> : null}

      <button type="submit" disabled={isPending} className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">
        {isPending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
