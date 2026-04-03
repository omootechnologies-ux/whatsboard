import Link from "next/link";
import { Plus } from "lucide-react";
import {
  DataCell,
  DataRow,
  DataTable,
  EmptyState,
  FilterToolbar,
  OrderCard,
  OrderStageBoard,
  PageHeader,
  PaymentBadge,
  SectionCard,
  StageBadge,
} from "@/components/whatsboard-dashboard/dashboard-ui";
import {
  formatCurrency,
  formatDate,
} from "@/components/whatsboard-dashboard/formatting";
import { listOrders } from "@/lib/whatsboard-repository";
import {
  formatOrderReference,
  getPrimaryOrderLabel,
} from "@/lib/display-labels";

type OrdersPageSearchParams = Promise<{
  search?: string;
  stage?: string;
  payment?: string;
}>;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: OrdersPageSearchParams;
}) {
  const query = await searchParams;
  const filteredOrders = await listOrders({
    search: query.search,
    stage: query.stage,
    payment: query.payment,
  });

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        title="Orders"
        description="Search, filter, and move orders quickly from inquiry to delivery without losing payment visibility."
        primaryAction={
          <Link href="/orders/new" className="wb-button-primary">
            <Plus className="h-4 w-4" />
            Create Order
          </Link>
        }
      />

      <FilterToolbar
        searchPlaceholder="Search by order ID, customer, product, or area"
        chips={[
          { key: "stage", label: "All stages" },
          { key: "stage", label: "New order", value: "new_order" },
          { key: "stage", label: "Awaiting payment", value: "waiting_payment" },
          { key: "stage", label: "Packing", value: "packing" },
          { key: "stage", label: "Dispatched", value: "dispatched" },
          { key: "payment", label: "Paid", value: "paid" },
          { key: "payment", label: "Unpaid", value: "unpaid" },
        ]}
      />

      <SectionCard
        title="Orders Board"
        description="Stage-by-stage workflow with touch-friendly cards."
      >
        <div className="-mx-1 overflow-x-auto pb-1">
          <div className="grid min-w-[960px] gap-4 xl:min-w-0 xl:grid-cols-4">
            <OrderStageBoard
              title="New order"
              orders={filteredOrders.filter(
                (order) => order.stage === "new_order",
              )}
            />
            <OrderStageBoard
              title="Awaiting payment"
              orders={filteredOrders.filter(
                (order) => order.stage === "waiting_payment",
              )}
            />
            <OrderStageBoard
              title="Paid / Packing"
              orders={filteredOrders.filter((order) =>
                ["paid", "packing"].includes(order.stage),
              )}
            />
            <OrderStageBoard
              title="Dispatch / Delivered"
              orders={filteredOrders.filter((order) =>
                ["dispatched", "delivered"].includes(order.stage),
              )}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Order ledger"
        description="Desktop table + mobile cards for clean scanning and quick actions."
      >
        <div className="hidden lg:block">
          {filteredOrders.length ? (
            <DataTable
              headers={[
                "Order",
                "Customer",
                "Stage",
                "Payment",
                "Amount",
                "Updated",
                "Action",
              ]}
            >
              {filteredOrders.map((order) => (
                <DataRow key={order.id}>
                  <DataCell>
                    <p className="font-semibold">
                      Order #{formatOrderReference(order.id) || "WB-00000"}
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-wb-text-muted)]">
                      {order.channel}
                    </p>
                  </DataCell>
                  <DataCell>
                    <p className="font-semibold">
                      {getPrimaryOrderLabel({
                        customerName: order.customerName,
                        customerPhone: order.customerPhone,
                        orderId: order.id,
                      })}
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-wb-text-muted)]">
                      {order.deliveryArea}
                    </p>
                  </DataCell>
                  <DataCell>
                    <StageBadge stage={order.stage} />
                  </DataCell>
                  <DataCell>
                    <PaymentBadge status={order.paymentStatus} />
                  </DataCell>
                  <DataCell>
                    <span className="font-semibold text-[var(--color-wb-primary)]">
                      {formatCurrency(order.amount)}
                    </span>
                  </DataCell>
                  <DataCell>
                    <span className="text-xs text-[var(--color-wb-text-muted)]">
                      {formatDate(order.updatedAt)}
                    </span>
                  </DataCell>
                  <DataCell compact>
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-sm font-semibold text-[var(--color-wb-primary)] hover:underline"
                    >
                      View
                    </Link>
                  </DataCell>
                </DataRow>
              ))}
            </DataTable>
          ) : (
            <EmptyState
              title="No orders found"
              detail="No orders match your current filters yet."
              action={
                <Link href="/orders/new" className="wb-button-secondary">
                  Create order
                </Link>
              }
            />
          )}
        </div>

        <div className="grid gap-3 lg:hidden">
          {filteredOrders.length ? (
            filteredOrders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block"
              >
                <OrderCard order={order} />
              </Link>
            ))
          ) : (
            <EmptyState
              title="No orders found"
              detail="No orders match your current filters yet."
            />
          )}
        </div>
      </SectionCard>
    </div>
  );
}
