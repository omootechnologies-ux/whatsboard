import Link from "next/link";
import { BellRing, CreditCard, Pencil, Plus, ShoppingBag, Truck } from "lucide-react";
import { getDashboardWriteAccess } from "@/lib/dashboard-access";
import { canAccessDashboardFeatureForUser, canUsePlanCapabilityForUser } from "@/lib/plan-access";
import { getDashboardData } from "@/lib/queries";
import {
  DashboardActionLink,
  DashboardBadge,
  DashboardEmptyState,
  DashboardFilterBar,
  DashboardHero,
  DashboardOrderStageBoard,
  DashboardPage,
  DashboardPanel,
  DashboardPanelHeader,
  DashboardStatCard,
} from "@/components/dashboard/page-primitives";
import { formatTZS } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function badgeTone(stage: string) {
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

function paymentTone(paymentStatus: string) {
  if (paymentStatus === "paid") return "success" as const;
  if (paymentStatus === "partial") return "warning" as const;
  return "danger" as const;
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; stage?: string; payment?: string }>;
}) {
  const { business, isAdmin, canCreateOrders, monthlyOrderLimit, orderCountThisMonth, remainingMonthlyOrders } =
    await getDashboardWriteAccess();
  const { orders: allOrders } = await getDashboardData();
  const resolvedSearch = (await searchParams) ?? {};
  const searchQuery = (resolvedSearch.q ?? "").trim().toLowerCase();
  const selectedStage = (resolvedSearch.stage ?? "").trim();
  const selectedPayment = (resolvedSearch.payment ?? "").trim();

  const orders = allOrders.filter((order) => {
    const matchesSearch =
      !searchQuery ||
      order.customerName.toLowerCase().includes(searchQuery) ||
      order.product.toLowerCase().includes(searchQuery) ||
      order.area.toLowerCase().includes(searchQuery) ||
      order.phone.toLowerCase().includes(searchQuery);
    const matchesStage = !selectedStage || order.stage === selectedStage;
    const matchesPayment = !selectedPayment || order.paymentStatus === selectedPayment;

    return matchesSearch && matchesStage && matchesPayment;
  });

  const canSeeCustomers = canAccessDashboardFeatureForUser("customers", business, isAdmin);
  const canSeeFollowUps = canAccessDashboardFeatureForUser("followUps", business, isAdmin);
  const canTrackPayments = canUsePlanCapabilityForUser("paymentTracking", business, isAdmin);
  const unsettledValue = orders
    .filter((order) => order.paymentStatus !== "paid")
    .reduce((sum, order) => sum + order.amount, 0);

  const columns = [
    {
      key: "new_order",
      title: "New order",
      tone: "neutral" as const,
      orders: orders
        .filter((order) => order.stage === "new_order")
        .map((order) => ({
          id: order.id,
          customerName: order.customerName,
          product: order.product,
          amount: order.amount,
          area: order.area,
          paymentStatus: canTrackPayments ? order.paymentStatus : undefined,
        })),
    },
    {
      key: "waiting_payment",
      title: "Awaiting payment",
      tone: "warning" as const,
      orders: orders
        .filter((order) => order.stage === "waiting_payment")
        .map((order) => ({
          id: order.id,
          customerName: order.customerName,
          product: order.product,
          amount: order.amount,
          area: order.area,
          paymentStatus: canTrackPayments ? order.paymentStatus : undefined,
        })),
    },
    {
      key: "packing",
      title: "Paid / Packing",
      tone: "primary" as const,
      orders: orders
        .filter((order) => ["paid", "packing"].includes(order.stage))
        .map((order) => ({
          id: order.id,
          customerName: order.customerName,
          product: order.product,
          amount: order.amount,
          area: order.area,
          paymentStatus: canTrackPayments ? order.paymentStatus : undefined,
        })),
    },
    {
      key: "dispatch",
      title: "Dispatch / Delivered",
      tone: "success" as const,
      orders: orders
        .filter((order) => ["dispatched", "delivered"].includes(order.stage))
        .map((order) => ({
          id: order.id,
          customerName: order.customerName,
          product: order.product,
          amount: order.amount,
          area: order.area,
          paymentStatus: canTrackPayments ? order.paymentStatus : undefined,
        })),
    },
  ];

  return (
    <DashboardPage>
      <DashboardHero
        eyebrow="Orders board"
        title="Run the full seller workflow from one premium orders board."
        description="Search fast, filter by stage or payment, and move between new orders, payment checks, packing, and delivery without losing the mobile-first rhythm."
        actions={
          <>
            <DashboardActionLink
              href={
                canCreateOrders
                  ? "/dashboard/orders/new"
                  : "/pricing?status=upgrade&message=Upgrade%20to%20Starter%20for%20more%20orders"
              }
              tone="primary"
            >
              <Plus className="h-4 w-4" />
              {canCreateOrders ? "Create order" : "Upgrade for more orders"}
            </DashboardActionLink>
            {canSeeFollowUps ? (
              <DashboardActionLink href="/dashboard/follow-ups">
                <BellRing className="h-4 w-4" />
                Open follow-ups
              </DashboardActionLink>
            ) : null}
            {canSeeCustomers ? <DashboardActionLink href="/dashboard/customers">Open customers</DashboardActionLink> : null}
          </>
        }
        aside={
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <DashboardStatCard
              label="Orders in board"
              value={String(orders.length)}
              detail="All visible orders after current filters."
              icon={<ShoppingBag className="h-5 w-5" />}
            />
            <DashboardStatCard
              label={canTrackPayments ? "Unsettled value" : "Free quota"}
              value={canTrackPayments ? formatTZS(unsettledValue) : `${orderCountThisMonth}/${monthlyOrderLimit ?? 30}`}
              detail={canTrackPayments ? "Cash still waiting to clear." : `${remainingMonthlyOrders ?? 0} free orders left this month.`}
              icon={<CreditCard className="h-5 w-5" />}
            />
            <DashboardStatCard
              label="Dispatch queue"
              value={String(orders.filter((order) => ["packing", "dispatched"].includes(order.stage)).length)}
              detail="Orders already moving beyond payment."
              icon={<Truck className="h-5 w-5" />}
            />
          </div>
        }
      />

      <DashboardFilterBar
        clearHref="/dashboard/orders"
        defaultSearch={resolvedSearch.q ?? ""}
        searchPlaceholder="Search customer, phone, product, or area"
        filters={[
          {
            name: "stage",
            defaultValue: selectedStage,
            options: [
              { label: "All stages", value: "" },
              { label: "New", value: "new_order" },
              { label: "Waiting payment", value: "waiting_payment" },
              { label: "Paid", value: "paid" },
              { label: "Packing", value: "packing" },
              { label: "Dispatched", value: "dispatched" },
              { label: "Delivered", value: "delivered" },
            ],
          },
          {
            name: "payment",
            defaultValue: selectedPayment,
            options: [
              { label: "All payments", value: "" },
              { label: "Unpaid", value: "unpaid" },
              { label: "Partial", value: "partial" },
              { label: "Paid", value: "paid" },
              { label: "COD", value: "cod" },
            ],
          },
        ]}
      />

      <DashboardPanel>
        <DashboardPanelHeader
          eyebrow="Board"
          title="Touch-friendly order stages"
          description="The board is the hero. Each column shows what needs your next action and keeps the workflow readable on any screen."
        />
        <div className="mt-5">
          <DashboardOrderStageBoard columns={columns} emptyMessage="No orders in this stage for the current filters." />
        </div>
      </DashboardPanel>

      <DashboardPanel>
        <DashboardPanelHeader
          eyebrow="Order ledger"
          title="Every order in one clean management view"
          description="Cards on mobile and a readable table on desktop so sellers can act quickly without horizontal chaos."
        />

        <section className="mt-5 space-y-3 md:hidden">
          {orders.length ? (
            orders.map((order) => (
              <div key={order.id} className="rounded-[24px] border border-[#dfe7e2] bg-white p-4 shadow-[0_12px_28px_rgba(17,17,17,0.04)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#111111]">{order.customerName}</p>
                    <p className="mt-1 text-xs text-[#5e6461]">{order.phone || "No phone"}</p>
                  </div>
                  <DashboardBadge tone={badgeTone(order.stage)}>{order.stage.replaceAll("_", " ")}</DashboardBadge>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="text-[#5e6461]">Product</p>
                    <p className="mt-1 truncate font-medium text-[#111111]">{order.product}</p>
                  </div>
                  <div>
                    <p className="text-[#5e6461]">Amount</p>
                    <p className="mt-1 font-bold text-[#0f5d46]">{formatTZS(order.amount)}</p>
                  </div>
                  <div>
                    <p className="text-[#5e6461]">Area</p>
                    <p className="mt-1 text-[#111111]">{order.area || "—"}</p>
                  </div>
                  {canTrackPayments ? (
                    <div>
                      <p className="text-[#5e6461]">Payment</p>
                      <div className="mt-1">
                        <DashboardBadge tone={paymentTone(order.paymentStatus)}>{order.paymentStatus}</DashboardBadge>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="mt-4 flex gap-3">
                  <Link
                    href={`/dashboard/orders/${order.id}`}
                    className="inline-flex flex-1 items-center justify-center rounded-2xl border border-[#dfe7e2] bg-[#f8fbf9] px-4 py-3 text-sm font-semibold text-[#173728]"
                  >
                    View details
                  </Link>
                  <Link
                    href={`/dashboard/orders/${order.id}/edit`}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0f5d46] px-4 py-3 text-sm font-semibold text-white"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <DashboardEmptyState
              title="No orders found"
              description="Try a different filter or create a new order to start the board."
            />
          )}
        </section>

        <section className="mt-5 hidden overflow-hidden rounded-[24px] border border-[#dfe7e2] md:block">
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="border-b border-[#e9eeeb] bg-[#f8fbf9]">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5e6461]">Order</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5e6461]">Customer</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5e6461]">Product</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5e6461]">Status</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5e6461]">Payment</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5e6461]">Amount</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5e6461]">Updated</th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5e6461]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length ? (
                  orders.map((order) => (
                    <tr key={order.id} className="border-b border-[#eef2ef] last:border-0">
                      <td className="px-4 py-4">
                        <div className="min-w-[120px]">
                          <p className="font-semibold text-[#111111]">#{order.id.slice(0, 8)}</p>
                          <p className="mt-1 text-xs text-[#5e6461]">{order.area || "No area"}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="min-w-[150px]">
                          <p className="font-semibold text-[#111111]">{order.customerName}</p>
                          <p className="mt-1 text-xs text-[#5e6461]">{order.phone || "No phone"}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-[#42514a]">{order.product}</td>
                      <td className="px-4 py-4">
                        <DashboardBadge tone={badgeTone(order.stage)}>{order.stage.replaceAll("_", " ")}</DashboardBadge>
                      </td>
                      <td className="px-4 py-4">
                        {canTrackPayments ? (
                          <DashboardBadge tone={paymentTone(order.paymentStatus)}>{order.paymentStatus}</DashboardBadge>
                        ) : (
                          <span className="text-sm text-[#5e6461]">Basic</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm font-bold text-[#0f5d46]">{formatTZS(order.amount)}</td>
                      <td className="px-4 py-4 text-sm text-[#5e6461]">
                        {order.updatedAt ? new Date(order.updatedAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/dashboard/orders/${order.id}`}
                            className="inline-flex items-center rounded-xl border border-[#dfe7e2] bg-[#f8fbf9] px-3 py-2 text-xs font-semibold text-[#173728]"
                          >
                            View
                          </Link>
                          <Link
                            href={`/dashboard/orders/${order.id}/edit`}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#0f5d46] px-3 py-2 text-xs font-semibold text-white"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-12">
                      <DashboardEmptyState
                        title="No orders found"
                        description="Try a different filter or create a new order to start the board."
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </DashboardPanel>
    </DashboardPage>
  );
}
