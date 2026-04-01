import { notFound } from "next/navigation";
import { ArrowLeft, ClipboardList, MapPin, Phone, Wallet } from "lucide-react";
import { getViewerContext } from "@/lib/queries";
import { formatTZS } from "@/lib/utils";
import {
  DashboardActionLink,
  DashboardBadge,
  DashboardEmptyState,
  DashboardHero,
  DashboardInfoGrid,
  DashboardPage,
  DashboardPanel,
  DashboardPanelHeader,
  DashboardStatCard,
} from "@/components/dashboard/page-primitives";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function toneForStage(stage: string) {
  const map: Record<string, "neutral" | "warning" | "primary" | "success"> = {
    new_order: "neutral",
    waiting_payment: "warning",
    paid: "primary",
    packing: "primary",
    dispatched: "primary",
    delivered: "success",
  };

  return map[stage] ?? "neutral";
}

function toneForPayment(status: string) {
  return status === "paid" ? "success" : status === "partial" ? "warning" : "danger";
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { supabase, businessId } = await getViewerContext();
  const { id } = await params;
  if (!businessId) return notFound();

  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, product_name, amount, delivery_area, stage, payment_status, notes, created_at, updated_at, customers(name, phone), order_activity(action, metadata, created_at)"
    )
    .eq("id", id)
    .eq("business_id", businessId)
    .single();

  if (!order) return notFound();

  const customer = Array.isArray(order.customers) ? order.customers[0] : order.customers;
  const activities = Array.isArray(order.order_activity) ? order.order_activity : [];

  return (
    <DashboardPage>
      <DashboardHero
        eyebrow="Orders"
        title={customer?.name ?? "Unknown customer"}
        description="Review the tracked order, current stage, payment state, notes, and activity in one consistent detail view."
        actions={
          <>
            <DashboardActionLink href={`/dashboard/orders/${order.id}/edit`} tone="primary">
              Edit order
            </DashboardActionLink>
            <DashboardActionLink href="/dashboard/orders">
              <ArrowLeft className="h-4 w-4" />
              Back to orders
            </DashboardActionLink>
          </>
        }
        aside={
          <div className="grid gap-3">
            <DashboardStatCard
              label="Order value"
              value={formatTZS(Number(order.amount))}
              detail="Tracked total for this order"
              icon={<Wallet className="h-5 w-5" />}
            />
            <DashboardStatCard
              label="Payment status"
              value={String(order.payment_status).replaceAll("_", " ")}
              detail="Current payment state"
              icon={<ClipboardList className="h-5 w-5" />}
            />
          </div>
        }
      />

      <DashboardInfoGrid columns="three">
        <DashboardStatCard
          label="Stage"
          value={String(order.stage).replaceAll("_", " ")}
          detail="Current workflow stage"
          icon={<ClipboardList className="h-5 w-5" />}
        />
        <DashboardStatCard
          label="Delivery area"
          value={order.delivery_area || "Not set"}
          detail="Current delivery destination"
          icon={<MapPin className="h-5 w-5" />}
        />
        <DashboardStatCard
          label="Customer phone"
          value={customer?.phone || "Not set"}
          detail="Primary contact for this order"
          icon={<Phone className="h-5 w-5" />}
        />
      </DashboardInfoGrid>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <DashboardPanel>
          <DashboardPanelHeader
            eyebrow="Order summary"
            title="Tracked details"
            description="Everything currently saved on this order record."
          />
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-secondary/50 p-4 sm:col-span-2">
              <p className="text-xs text-muted-foreground">Product</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{order.product_name}</p>
            </div>
            <div className="rounded-2xl border border-border bg-secondary/50 p-4">
              <p className="text-xs text-muted-foreground">Stage</p>
              <div className="mt-2">
                <DashboardBadge tone={toneForStage(String(order.stage))}>
                  {String(order.stage).replaceAll("_", " ")}
                </DashboardBadge>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-secondary/50 p-4">
              <p className="text-xs text-muted-foreground">Payment</p>
              <div className="mt-2">
                <DashboardBadge tone={toneForPayment(String(order.payment_status))}>
                  {String(order.payment_status).replaceAll("_", " ")}
                </DashboardBadge>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-secondary/50 p-4 sm:col-span-2">
              <p className="text-xs text-muted-foreground">Notes</p>
              <p className="mt-2 text-sm leading-6 text-foreground/80">{order.notes || "No notes saved yet."}</p>
            </div>
          </div>
        </DashboardPanel>

        <DashboardPanel>
          <DashboardPanelHeader
            eyebrow="Timeline"
            title="Order activity"
            description="Recent changes attached to this order."
          />
          <div className="mt-5 space-y-3">
            {activities.length ? (
              activities.map((item: any, index: number) => (
                <div key={index} className="rounded-2xl border border-border bg-secondary/40 p-4">
                  <p className="font-semibold text-foreground">{item.action}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            ) : (
              <DashboardEmptyState
                title="No activity yet"
                description="Activity entries will appear here as this order is updated."
              />
            )}
          </div>
        </DashboardPanel>
      </section>
    </DashboardPage>
  );
}
