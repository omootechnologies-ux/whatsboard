import { notFound } from "next/navigation";
import { ArrowLeft, ClipboardList, Wallet } from "lucide-react";
import { getDashboardWriteAccess } from "@/lib/dashboard-access";
import { getOrderCatalogOptions, getViewerContext } from "@/lib/queries";
import {
  canUsePlanCapabilityForUser,
  getAllowedOrderStagesForUser,
  getAllowedPaymentStatusesForUser,
} from "@/lib/plan-access";
import UpdateOrderForm from "@/components/forms/update-order-form";
import {
  DashboardActionLink,
  DashboardHero,
  DashboardPage,
  DashboardPanel,
  DashboardPanelHeader,
  DashboardStatCard,
} from "@/components/dashboard/page-primitives";
import { formatTZS } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EditOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { business, isAdmin, canManageRecords, monthlyOrderLimit, orderCountThisMonth, remainingMonthlyOrders } =
    await getDashboardWriteAccess();
  const { supabase, businessId } = await getViewerContext();
  const { id } = await params;
  const catalogProducts = businessId ? await getOrderCatalogOptions() : [];

  if (!businessId) notFound();

  const { data: order } = await supabase
    .from("orders")
    .select(`
      id,
      catalog_product_id,
      product_name,
      amount,
      delivery_area,
      stage,
      payment_status,
      notes,
      customer_id,
      customers(id, name, phone)
    `)
    .eq("business_id", businessId)
    .eq("id", id)
    .maybeSingle();

  if (!order) notFound();

  const customer = Array.isArray(order.customers) ? order.customers[0] : order.customers;

  const normalizedOrder = {
    id: order.id,
    catalog_product_id: order.catalog_product_id ?? "",
    customer_name: customer?.name ?? "",
    phone: customer?.phone ?? "",
    product_name: order.product_name ?? "",
    amount: order.amount ?? 0,
    delivery_area: order.delivery_area ?? "",
    stage: order.stage ?? "new_order",
    payment_status: order.payment_status ?? "unpaid",
    notes: order.notes ?? "",
  };
  const canUsePaymentTracking = canUsePlanCapabilityForUser("paymentTracking", business, isAdmin);
  const canUseFollowUps = canUsePlanCapabilityForUser("followUpReminders", business, isAdmin);

  return (
    <DashboardPage>
      <DashboardHero
        eyebrow="Orders"
        title={`Edit ${normalizedOrder.customer_name || "customer"}'s order`}
        description="Update the tracked order without leaving the same operating system layout used everywhere else in the dashboard."
        actions={
          <>
            <DashboardActionLink href={`/dashboard/orders/${order.id}`}>
              View details
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
              label="Current amount"
              value={formatTZS(Number(normalizedOrder.amount ?? 0))}
              detail="Current order value"
              icon={<Wallet className="h-5 w-5" />}
            />
            <DashboardStatCard
              label="Current stage"
              value={(normalizedOrder.stage ?? "new_order").replaceAll("_", " ")}
              detail={canUsePaymentTracking ? "Payment tracking active" : "Basic tracking mode"}
              icon={<ClipboardList className="h-5 w-5" />}
            />
          </div>
        }
      />

      <DashboardPanel>
        <DashboardPanelHeader
          eyebrow="Order form"
          title="Edit tracked order"
          description="Changes here update the same order, customer, and follow-up workflow surfaced across the rest of the dashboard."
        />
        <div className="mt-5">
          <UpdateOrderForm
            order={normalizedOrder}
            catalogProducts={catalogProducts}
            canManageRecords={canManageRecords}
            allowedStages={getAllowedOrderStagesForUser(business, isAdmin)}
            allowedPaymentStatuses={getAllowedPaymentStatusesForUser(business, isAdmin)}
            canUseFollowUps={canUseFollowUps}
            canUsePaymentTracking={canUsePaymentTracking}
            monthlyOrderLimit={monthlyOrderLimit}
            orderCountThisMonth={orderCountThisMonth}
            remainingMonthlyOrders={remainingMonthlyOrders}
          />
        </div>
      </DashboardPanel>
    </DashboardPage>
  );
}
