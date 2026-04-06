import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { getLocale } from "next-intl/server";
import {
  PageHeader,
  SectionCard,
} from "@/components/whatsboard-dashboard/dashboard-ui";

type NewOrderSearchParams = Promise<{ error?: string }>;

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: NewOrderSearchParams;
}) {
  const query = await searchParams;
  const locale = await getLocale();
  const isSw = locale === "sw";
  const hasError =
    query.error === "invalid" ||
    query.error === "persistence" ||
    query.error === "order-limit";

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        title={isSw ? "Unda order" : "Create order"}
        description={
          isSw
            ? "Nasa mauzo mapya kutoka WhatsApp au social chat kwenye mtiririko mmoja safi."
            : "Capture a new sale from WhatsApp or social chat in one clean flow."
        }
        primaryAction={
          <button
            className="wb-button-primary"
            type="submit"
            form="create-order-form"
          >
            <Save className="h-4 w-4" />
            {isSw ? "Hifadhi order" : "Save order"}
          </button>
        }
        secondaryAction={
          <Link href="/orders" className="wb-button-secondary">
            <ArrowLeft className="h-4 w-4" />
            {isSw ? "Rudi kwa orders" : "Back to orders"}
          </Link>
        }
      />

      <SectionCard
        title={isSw ? "Maelezo ya order" : "Order details"}
        description={
          isSw
            ? "Hifadhi moja kwa moja kwenye workspace yako active ya Supabase."
            : "Save directly to your active Supabase workspace."
        }
      >
        {hasError ? (
          <div className="mb-4 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700">
            {query.error === "invalid"
              ? isSw
                ? "Tafadhali jaza sehemu zote muhimu kwa thamani sahihi."
                : "Please fill all required fields with valid values."
              : query.error === "order-limit"
                ? isSw
                  ? "Kikomo cha order za mwezi kwa plan ya Bure kimefikiwa (30). Boresha plan kwenye Billing ili kuendelea kuunda orders mpya."
                  : "Free plan monthly order limit reached (30). Upgrade your plan on Billing to continue creating new orders."
              : isSw
                ? "Imeshindikana kuunda order. Angalia muunganiko wa Supabase kisha jaribu tena."
                : "Could not create order. Check your Supabase connection and try again."}
          </div>
        ) : null}

        <form
          id="create-order-form"
          action="/api/orders"
          method="post"
          className="grid gap-4 sm:grid-cols-2"
        >
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              {isSw ? "Jina la mteja" : "Customer name"}
            </label>
            <input
              name="customerName"
              required
              className="wb-input"
              placeholder="Amina Mushi"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              {isSw ? "Simu ya mteja" : "Customer phone"}
            </label>
            <input
              name="customerPhone"
              className="wb-input"
              placeholder="+255 754 000 000"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              Channel
            </label>
            <select name="channel" className="wb-input" defaultValue="WhatsApp">
              <option>WhatsApp</option>
              <option>Instagram</option>
              <option>TikTok</option>
              <option>Facebook</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              {isSw ? "Hatua" : "Stage"}
            </label>
            <select name="stage" className="wb-input" defaultValue="new_order">
              <option value="new_order">{isSw ? "Order mpya" : "New order"}</option>
              <option value="waiting_payment">
                {isSw ? "Inasubiri malipo" : "Awaiting payment"}
              </option>
              <option value="paid">{isSw ? "Imelipwa" : "Paid"}</option>
              <option value="packing">{isSw ? "Inapakiwa" : "Packing"}</option>
              <option value="dispatched">{isSw ? "Imetumwa" : "Dispatched"}</option>
              <option value="delivered">{isSw ? "Imefika" : "Delivered"}</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              {isSw ? "Hali ya malipo" : "Payment status"}
            </label>
            <select
              name="paymentStatus"
              className="wb-input"
              defaultValue="unpaid"
            >
              <option value="unpaid">{isSw ? "Haijalipwa" : "Unpaid"}</option>
              <option value="partial">{isSw ? "Sehemu" : "Partial"}</option>
              <option value="paid">{isSw ? "Imelipwa" : "Paid"}</option>
              <option value="cod">COD</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              {isSw ? "Kiasi (TZS)" : "Amount (TZS)"}
            </label>
            <input
              name="amount"
              required
              type="number"
              min="1"
              className="wb-input"
              placeholder="85000"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              {isSw ? "Eneo la delivery" : "Delivery area"}
            </label>
            <input
              name="deliveryArea"
              required
              className="wb-input"
              placeholder="Dar es Salaam"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              {isSw ? "Items (zitenganishe kwa koma)" : "Items (comma separated)"}
            </label>
            <textarea
              name="items"
              className="wb-textarea"
              placeholder="2x Ankara set, 1x delivery fee"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-[var(--color-wb-text)]">
              {isSw ? "Maelezo" : "Notes"}
            </label>
            <textarea
              name="notes"
              className="wb-textarea"
              placeholder={
                isSw
                  ? "Mteja ameomba courier wa haraka."
                  : "Customer asked for fast courier option."
              }
            />
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
