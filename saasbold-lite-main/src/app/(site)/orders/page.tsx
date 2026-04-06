import Link from "next/link";
import { Plus } from "lucide-react";
import { getLocale } from "next-intl/server";
import {
  BuyerBadge,
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
import { PaymentSmsModal } from "@/components/whatsboard-dashboard/payment-sms-modal";

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
  const locale = await getLocale();
  const isSw = locale === "sw";
  const [filteredOrders, allOrders] = await Promise.all([
    listOrders({
      search: query.search,
      stage: query.stage,
      payment: query.payment,
    }),
    listOrders(),
  ]);
  const orderOptions = allOrders.map((order) => ({
    id: order.id,
    customerLabel: getPrimaryOrderLabel({
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      orderId: order.id,
      kind: "customer",
    }),
    amount: order.amount,
  }));

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        title={isSw ? "Orders" : "Orders"}
        description={
          isSw
            ? "Tafuta, chuja, na songesha orders haraka kutoka inquiry hadi delivery bila kupoteza mwonekano wa malipo."
            : "Search, filter, and move orders quickly from inquiry to delivery without losing payment visibility."
        }
        primaryAction={
          <Link href="/orders/new" className="wb-button-primary">
            <Plus className="h-4 w-4" />
            {isSw ? "Unda Order" : "Create Order"}
          </Link>
        }
        secondaryAction={
          <PaymentSmsModal orderOptions={orderOptions} />
        }
      />

      <FilterToolbar
        searchPlaceholder={
          isSw
            ? "Tafuta kwa order ID, mteja, bidhaa au eneo"
            : "Search by order ID, customer, product, or area"
        }
        chips={[
          { key: "stage", label: isSw ? "Hatua zote" : "All stages" },
          {
            key: "stage",
            label: isSw ? "Order mpya" : "New order",
            value: "new_order",
          },
          {
            key: "stage",
            label: isSw ? "Inasubiri malipo" : "Awaiting payment",
            value: "waiting_payment",
          },
          { key: "stage", label: isSw ? "Inapakiwa" : "Packing", value: "packing" },
          {
            key: "stage",
            label: isSw ? "Imetumwa" : "Dispatched",
            value: "dispatched",
          },
          { key: "payment", label: isSw ? "Imelipwa" : "Paid", value: "paid" },
          {
            key: "payment",
            label: isSw ? "Haijalipwa" : "Unpaid",
            value: "unpaid",
          }
        ]}
      />

      <SectionCard
        title={isSw ? "Board ya Orders" : "Orders Board"}
        description={
          isSw
            ? "Workflow ya hatua kwa hatua yenye kadi rafiki kwa mguso."
            : "Stage-by-stage workflow with touch-friendly cards."
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <OrderStageBoard
            title={isSw ? "Order mpya" : "New order"}
            orders={filteredOrders.filter(
              (order) => order.stage === "new_order",
            )}
          />
          <OrderStageBoard
            title={isSw ? "Inasubiri malipo" : "Awaiting payment"}
            orders={filteredOrders.filter(
              (order) => order.stage === "waiting_payment",
            )}
          />
          <OrderStageBoard
            title={isSw ? "Imelipwa / Inapakiwa" : "Paid / Packing"}
            orders={filteredOrders.filter((order) =>
              ["paid", "packing"].includes(order.stage),
            )}
          />
          <OrderStageBoard
            title={isSw ? "Kutuma / Imefika" : "Dispatch / Delivered"}
            orders={filteredOrders.filter((order) =>
              ["dispatched", "delivered"].includes(order.stage),
            )}
          />
        </div>
      </SectionCard>

      <SectionCard
        title={isSw ? "Daftari la Orders" : "Order ledger"}
        description={
          isSw
            ? "Jedwali la desktop pamoja na kadi za simu kwa ukaguzi safi na vitendo vya haraka."
            : "Desktop table + mobile cards for clean scanning and quick actions."
        }
      >
        <div className="hidden lg:block">
          {filteredOrders.length ? (
            <DataTable
              headers={[
                isSw ? "Order" : "Order",
                isSw ? "Mteja" : "Customer",
                isSw ? "Hatua" : "Stage",
                isSw ? "Malipo" : "Payment",
                isSw ? "Kiasi" : "Amount",
                isSw ? "Imeboreshwa" : "Updated",
                isSw ? "Kitendo" : "Action",
              ]}
            >
              {filteredOrders.map((order) => (
                <DataRow key={order.id}>
                  <DataCell>
                    <p className="font-semibold">
                      {(isSw ? "Order #" : "Order #") +
                        (formatOrderReference(order.id) || "WB-00000")}
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
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <BuyerBadge status={order.customerBuyerStatus} compact />
                      <span className="text-[11px] font-semibold text-[var(--color-wb-text-muted)]">
                        LTV {formatCurrency(order.customerLifetimeValue || 0)}
                      </span>
                    </div>
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
                      {isSw ? "Tazama" : "View"}
                    </Link>
                  </DataCell>
                </DataRow>
              ))}
            </DataTable>
          ) : (
            <EmptyState
              title={isSw ? "Hakuna order zilizopatikana" : "No orders found"}
              detail={
                isSw
                  ? "Hakuna order zinazolingana na filters zako kwa sasa."
                  : "No orders match your current filters yet."
              }
              action={
                <Link href="/orders/new" className="wb-button-secondary">
                  {isSw ? "Unda order" : "Create order"}
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
              title={isSw ? "Hakuna order zilizopatikana" : "No orders found"}
              detail={
                isSw
                  ? "Hakuna order zinazolingana na filters zako kwa sasa."
                  : "No orders match your current filters yet."
              }
            />
          )}
        </div>
      </SectionCard>
    </div>
  );
}
